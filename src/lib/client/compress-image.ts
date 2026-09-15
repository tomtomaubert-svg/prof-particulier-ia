"use client";

// Une vraie photo de téléphone pèse souvent plusieurs Mo — au-delà de 4,5 Mo,
// Vercel rejette la requête avant même qu'elle n'atteigne notre code (413
// Payload Too Large), avec un message d'erreur navigateur peu clair côté
// client. On redimensionne et recompresse donc toujours côté client avant
// l'envoi ; ça normalise aussi les formats exotiques (HEIC iPhone) en JPEG.
export function compressImageFile(file: File, maxDimension = 1800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Lecture du fichier impossible"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Cette image n'a pas pu être lue."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Ton navigateur ne permet pas de traiter cette image."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
