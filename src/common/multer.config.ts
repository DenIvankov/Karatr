import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UPLOADS_DIR } from './uploads-path';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const multerConfig = {
  storage: diskStorage({
    destination: (_, file, cb) => {
      let folder: string;

      if (file.fieldname === 'avatar') {
        folder = join(UPLOADS_DIR, 'avatar');
      } else if (file.fieldname === 'background') {
        folder = join(UPLOADS_DIR, 'background');
      } else {
        folder = join(UPLOADS_DIR, 'other');
      }

      if (!existsSync(folder)) {
        mkdirSync(folder, { recursive: true });
      }

      cb(null, folder);
    },
    filename: (_, file, cb) => {
      const uniqueSuffix = Date.now();
      const ext = extname(file.originalname).toLowerCase();
      const filename = `${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (_, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error('Недопустимый тип файла. Разрешены только JPEG, PNG, WebP'),
        false,
      );
    }

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(
        new Error(
          'Недопустимое расширение файла. Разрешены только .jpg, .jpeg, .png, .webp',
        ),
        false,
      );
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
