import { execSync } from 'child_process';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const isEncoreCloud = !!process.env.ENCORE_TSBUNDLER_PATH;

/** In Encore Cloud builds, we build the workspace packages as part of the postinstall script */
if (isEncoreCloud) {
  execSync('echo "🔄 Building workspace packages..."', { stdio: 'inherit' });
  execSync('pnpm -C ../.. run build:packages', { stdio: 'inherit' });
  
  execSync('echo "🔄 Building @wiretap/temporal package..."', { stdio: 'inherit' });
  execSync('pnpm -C ../.. --filter @wiretap/temporal build', { stdio: 'inherit' });
}
