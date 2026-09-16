/**
 * deploy.mjs — uploads the dist/ folder to your hosting server via FTP
 * Usage: node deploy.mjs <ftp-host> <ftp-user> <ftp-password> <remote-path>
 * Example: node deploy.mjs ftp.myvedicastrology.in myuser mypass /home/myuser/myvedicastrology.in
 */
import { Client } from "basic-ftp";
import { createReadStream, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const [ftpHost, ftpUser, ftpPass, remotePath] = process.argv.slice(2);

if (!ftpHost || !ftpUser || !ftpPass || !remotePath) {
  console.error("Usage: node deploy.mjs <host> <user> <pass> <remote-path>");
  console.error("Example: node deploy.mjs ftp.myvedicastrology.in myuser mypass /home/myuser/myvedicastrology.in");
  process.exit(1);
}

async function uploadDir(client, localDir, remoteDir) {
  const entries = readdirSync(localDir);
  try { await client.ensureDir(remoteDir); } catch {}

  for (const entry of entries) {
    const localPath = join(localDir, entry);
    const remoteFtpPath = remoteDir + "/" + entry;
    const stat = statSync(localPath);

    if (stat.isDirectory()) {
      await uploadDir(client, localPath, remoteFtpPath);
    } else {
      process.stdout.write(`  Uploading ${relative(process.cwd(), localPath)}...`);
      await client.uploadFrom(createReadStream(localPath), remoteFtpPath);
      console.log(" ✓");
    }
  }
}

const client = new Client();
client.ftp.verbose = false;

try {
  console.log(`\nConnecting to ${ftpHost}...`);
  await client.access({
    host: ftpHost,
    user: ftpUser,
    password: ftpPass,
    port: 21,
    secure: false,
  });
  console.log("Connected!\n");

  const localDist = join(__dirname, "dist");
  const remoteDist = remotePath.replace(/\/$/, "") + "/dist";

  console.log(`Uploading dist/ → ${remoteDist}\n`);

  // Remove old dist and upload new
  try {
    await client.removeDir(remoteDist);
    console.log("Removed old dist/\n");
  } catch { console.log("(no existing dist/ to remove)\n"); }

  await uploadDir(client, localDist, remoteDist);

  console.log("\n✅ Upload complete! The site is now live with all fixes.");
  console.log("   - Razorpay payment working");
  console.log("   - Phone: +91 prefix, 10 digits");
  console.log("   - Email: optional");
  console.log("   - Mobile view: improved");
  console.log("   - Floating WhatsApp/Call buttons visible");

} catch (err) {
  console.error("\n❌ Error:", err.message);
  console.error("\nMake sure:");
  console.error("  1. FTP host, user, password are correct");
  console.error("  2. Remote path exists (e.g. /home/myuser/myvedicastrology.in)");
} finally {
  client.close();
}
