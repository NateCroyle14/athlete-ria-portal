import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const PKGS_DIR = path.join(ROOT, "packages");

async function peerifyOne(pkgJsonPath) {
  const raw = await fs.readFile(pkgJsonPath, "utf8");
  const pkg = JSON.parse(raw);

  pkg.peerDependencies = pkg.peerDependencies || {};
  pkg.devDependencies = pkg.devDependencies || {};
  pkg.dependencies = pkg.dependencies || {};

  const move = (field) => {
    if (!pkg[field]) return;
    for (const k of ["react", "react-dom"]) {
      if (pkg[field][k]) {
        // move to peerDependencies ^18.2.0
        pkg.peerDependencies[k] = "^18.2.0";
        delete pkg[field][k];
      }
    }
  };

  move("dependencies");     // ← remove react/react-dom from deps
  move("devDependencies");  // ← and from devDeps, if present

  // Keep types in devDependencies if you want TS types locally
  pkg.devDependencies["@types/react"] = pkg.devDependencies["@types/react"] || "^18.2.66";
  pkg.devDependencies["@types/react-dom"] = pkg.devDependencies["@types/react-dom"] || "^18.2.22";

  // Write back
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  console.log("peerified:", pkg.name || pkgJsonPath);
}

async function run() {
  let entries = [];
  try {
    entries = await fs.readdir(PKGS_DIR, { withFileTypes: true });
  } catch {
    console.log("No packages/* directory; nothing to peerify.");
    return;
  }

  const promises = entries
    .filter((d) => d.isDirectory())
    .map(async (d) => {
      const pkgJson = path.join(PKGS_DIR, d.name, "package.json");
      try {
        await fs.access(pkgJson);
        await peerifyOne(pkgJson);
      } catch {
        // ignore folders without package.json
      }
    });

  await Promise.all(promises);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});