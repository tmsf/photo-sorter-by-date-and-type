import fs from "fs";
import fexif from "fast-exif";
import { exiftool } from "exiftool-vendored";
import path from "path";
// const sourceDir = "./example";
// const destDir = "./out";

const raw = ["DNG", "dng", "Dng"];
const jpg = ["JPG", "Jpg", "jpg"];

const init = async (sourceDir) => {

  const directory = fs.readdirSync(sourceDir)
  
  directory.forEach(async (item) => {
    await organiseImage(item, sourceDir);
  });
};


const organiseImage = async (imageFileName, sourceDir) => {
  // if (isImage(imageFileName)) {
    const data = await getImageData(imageFileName, sourceDir);
    // console.log("data", data)
    if (data) {
      await copyImageToProperFolder(data);
      return data;
    } else {
      console.log("ignoring ", imageFileName)
    }
    
  // } 
};



const getImageData = async (imageFileName, sourceDir) => {
  console.log("image data:", `${sourceDir}/${imageFileName}`)
   
  
  const exif = await exiftool.read(`${sourceDir}/${imageFileName}`);
  const { 
    DateTimeOriginal, 
    SourceFile, 
    FileName, 
    FileTypeExtension 
  } = exif
  if (!FileTypeExtension) return undefined

  const fmtDate = DateTimeOriginal?.toDate().toISOString().split('T')[0]
  // console.log("data ", {
  //   sourceDir,
  //   fmtDate,
  //   SourceFile,
  //   FileName,
  //   FileTypeExtension
  // })
  return {
    sourceDir,
    fmtDate,
    SourceFile,
    FileName,
    FileTypeExtension
  };
};

const copyImageToProperFolder = async ({
  sourceDir,
  fmtDate,
  SourceFile,
  FileName,
  FileTypeExtension,
}) => {
  
  const destDir = `${sourceDir}/out/`
  const pathi = await path.resolve(SourceFile);
  console.log("path ", pathi);
  
  const dir = await createDirs(destDir, fmtDate, FileTypeExtension);
  
  await fs.cpSync(pathi, `${dir}/${FileName}`, { preserveTimestamps: true})
};

const createDirs = async (dir, fmtDate,  FileTypeExtension) => {
  let fullDir = dir
  if ( raw.includes(FileTypeExtension) ) {
    fullDir = `${fullDir}/raw/${fmtDate}`
  } else {
    fullDir = `${fullDir}/jpg-camera/${fmtDate}`
  }

  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }
  return fullDir
};



const dir = process.argv.slice(2);
console.log("dir", dir)
if (dir.length < 1) {
  throw new Error("needs to define a path to organise" )
}
init(dir[0]);
