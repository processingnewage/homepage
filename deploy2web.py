import shutil
import subprocess
import hashlib
import re
from pathlib import Path
from datetime import datetime


def get_file_hash(file_path: Path) -> str:
    """Get MD5 hash of a file (first 8 characters for brevity)."""
    try:
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()[:8]
    except Exception:
        return ""


def add_cache_buster_to_html(file_path: Path, version: str):
    """Add cache busting query parameter to static assets in HTML files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Add version to static asset paths (CSS, JS, images)
        # Only match paths without existing ?v= parameter
        replacements = [
            (r'(href="/_next/static/[^"?]+")', r'\1?v=' + version),
            (r'(src="/_next/static/[^"?]+")', r'\1?v=' + version),
            (r'(src="/blog/[^"?]+\.(png|jpg|jpeg|gif|webp|svg)")', r'\1?v=' + version),
            (r'(href="/blog/[^"?]+\.(png|jpg|jpeg|gif|webp|svg)")', r'\1?v=' + version),
            (r'(src="/papers/[^"?]+\.(png|jpg|jpeg|gif|webp|svg)")', r'\1?v=' + version),
            (r'(href="/papers/[^"?]+\.(png|jpg|jpeg|gif|webp|svg)")', r'\1?v=' + version),
        ]

        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)

        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
    except Exception as e:
        print(f"Warning: Failed to add cache buster to {file_path}: {e}")


def process_directory(directory: Path, version: str):
    """Recursively process all HTML files in directory to add cache busting."""
    for html_file in directory.rglob('*.html'):
        add_cache_buster_to_html(html_file, version)


def main():
    target_repo = Path("../processingnewage.github.io").resolve()
    source_dir = Path("out").resolve()

    # Generate version based on timestamp
    version = datetime.now().strftime("%Y%m%d%H%M%S")

    # 1. Execute "npm run build" in the current directory
    print(">>> Executing 'npm run build'...")
    try:
        subprocess.run(["npm", "run", "build"], check=True)
    except subprocess.CalledProcessError:
        print("Error: 'npm run build' failed. Please check the build logs.")
        return
    except FileNotFoundError:
        print("Error: 'npm' command not found. Please ensure Node.js is installed and in your PATH.")
        return

    # 1.5 Add cache busting to static assets
    print(f">>> Adding cache busting (v={version})...")
    process_directory(source_dir, version)

    # 2. Move the generated files to the target directory
    print(f">>> Moving files from {source_dir.name}/ to {target_repo}...")
    if not source_dir.exists():
        print(f"Error: Directory '{source_dir}' not found. Ensure the build was successful.")
        return

    shutil.copytree(source_dir, target_repo, dirs_exist_ok=True)

    shutil.rmtree(source_dir)

    # 3. Execute Git operations in the target directory
    print(f">>> Preparing to commit and push in {target_repo}...")
    try:
        subprocess.run(["git", "add", "."], cwd=target_repo, check=True)

        status_result = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=target_repo,
            capture_output=True,
            text=True,
            check=True
        )

        if not status_result.stdout.strip():
            print(">>> No file changes detected. Skipping commit and push.")
            return

        print(">>> Executing 'git commit'...")
        subprocess.run(["git", "commit", "-m", "deploy"], cwd=target_repo, check=True)

        print(">>> Pushing to the remote repository...")
        subprocess.run(["git", "push"], cwd=target_repo, check=True)
        print(">>> 🎉 Deployment successful!")

    except subprocess.CalledProcessError as e:
        print(f"Error: Git operation failed (Return code: {e.returncode})")
    except FileNotFoundError:
        print("Error: 'git' command not found. Please ensure Git is installed.")


if __name__ == "__main__":
    main()
