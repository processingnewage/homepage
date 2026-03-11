import shutil
import subprocess
from pathlib import Path


def main():
    target_repo = Path("../processingnewage.github.io").resolve()
    source_dir = Path("out").resolve()

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
