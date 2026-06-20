const fs = require('fs');
const path = require('path');

const filePaths = [
  "features/admin/pages/APTIS/exam/ExamAptisManagerPage.jsx",
  "features/admin/pages/IELTS/exam/ExamManagerPage.jsx",
  "features/admin/pages/IELTS/listening/ListeningManagerPage.jsx",
  "features/admin/pages/IELTS/reading/ReadingManagerPage.jsx",
  "features/admin/pages/IELTS/speaking/SpeakingManagerPage.jsx",
  "features/admin/pages/IELTS/writing/WritingManagerPage.jsx"
].map(p => path.join(__dirname, p));

const regex = /<div className="p-6 bg-slate-50 min-h-screen font-sans">\s*<div className="max-w-7xl mx-auto space-y-6">\s*\{\/\* Header \*\/\}\s*<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">\s*<div>\s*<Title\s*level=\{2\}\s*className="m-0! flex items-center gap-3 text-slate-800!"\s*>\s*<div className="p-2 bg-blue-600 text-white rounded-lg">\s*<(.+?) \/>\s*<\/div>\s*([^<]+?)\s*<\/Title>\s*<Text className="text-slate-500 mt-1 block">\s*([^<]+?)\s*<\/Text>\s*<\/div>\s*<Button\s*type="primary"\s*size="large"\s*icon=\{<PlusOutlined \/>\}\s*onClick=\{\(\) => navigate\("([^"]+)"\)\}\s*className="bg-blue-600 hover:bg-blue-500 shadow-md font-semibold rounded-xl"\s*>\s*Create New Test\s*<\/Button>\s*<\/div>/;

filePaths.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log("Missing:", file);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');

  // IELTS vs APTIS colors
  const isAptis = file.includes('APTIS');
  const gradient = isAptis ? "from-purple-600 via-fuchsia-600 to-pink-600 shadow-fuchsia-500/20" : "from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/20";
  const btnText = isAptis ? "text-fuchsia-600 hover:text-fuchsia-700" : "text-blue-600 hover:text-blue-700";

  const replacement = `<div className="max-w-[1440px] mx-auto animate-fade-in space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[32px] p-8 md:p-10 bg-gradient-to-br ${gradient} shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative z-10">
            <Title level={2} className="!text-white !mb-2 !font-extrabold tracking-tight drop-shadow-md flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 text-white">
                <$1 />
              </div>
              $2
            </Title>
            <Text className="!text-white/80 text-lg font-medium tracking-wide block">
              $3
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate("$4")}
            className="relative z-10 bg-white ${btnText} hover:bg-white hover:scale-105 border-none shadow-lg font-bold rounded-xl h-12 px-6 transition-all duration-300"
          >
            Create New Test
          </Button>

          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl mix-blend-overlay animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white opacity-5 blur-2xl mix-blend-overlay" />
        </div>`;

  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    // Also remove the wrapper </div></div> at the bottom!
    // Since we removed `<div className="p-6 bg-slate-50 min-h-screen font-sans">` and `<div className="max-w-7xl mx-auto space-y-6">` 
    // Wait, in my replacement I replaced both outer divs with ONE: `<div className="max-w-[1440px] mx-auto animate-fade-in space-y-6">`
    // So there is one less div to close.
    // I should remove the last `</div>` before `);`
    
    // Replace the trailing `</div>\n    </div>\n  );\n};` with `</div>\n  );\n};`
    content = content.replace(/<\/div>\s*<\/div>\s*\);\s*\};/g, "</div>\n  );\n};");

    // Enhance Filter Card
    content = content.replace(
      /className="rounded-2xl shadow-sm border-slate-200"/g, 
      'className="rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 bg-white"'
    );
    // Enhance Table Card
    content = content.replace(
      /className="rounded-2xl shadow-sm border-slate-200 overflow-hidden"/g,
      'className="rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100 bg-white overflow-hidden"'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated:", file);
  } else {
    console.log("Regex didn't match for:", file);
  }
});
