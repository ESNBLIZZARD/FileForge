const fs = require('fs');
const pkgPath = 'node_modules/muhammara/package.json';

try {
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.binary && !pkg.binary.napi_versions) {
            pkg.binary.napi_versions = [0]; // Dummy value to satisfy Turbopack
            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
            console.log('Successfully patched muhammara package.json');
        } else {
            console.log('muhammara package.json already has napi_versions or no binary field.');
        }
    } else {
        console.error('muhammara package.json not found at ' + pkgPath);
    }
} catch (err) {
    console.error('Error patching muhammara:', err);
}
