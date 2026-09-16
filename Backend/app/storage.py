from pathlib import Path


STORAGE_DIR = Path("storage")

STORAGE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


def save_file(
    file_content: bytes,
    file_hash: str
) -> str:

    file_path = STORAGE_DIR / file_hash

    file_path.write_bytes(file_content)

    return str(file_path)