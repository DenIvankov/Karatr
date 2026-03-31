import { resolve } from 'path';

const PROJECT_ROOT = resolve(__dirname, '..', '..');

export const UPLOADS_DIR = resolve(PROJECT_ROOT, 'uploads');
export const POSTS_UPLOADS_DIR = resolve(UPLOADS_DIR, 'posts');
