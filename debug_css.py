import sys

file_path = r'c:\Users\mjuik\RoguelikeRPG\css\styles.css'
with open(file_path, 'rb') as f:
    content = f.read().decode('utf-8', errors='ignore')
    lines = content.splitlines(keepends=True)

# 1-indexed lines to 0-indexed
def print_lines(start, end):
    print(f"--- Lines {start}-{end} ---")
    for i in range(start-1, end):
        if i < len(lines):
            print(f"{i+1}: {repr(lines[i])}")

print_lines(2960, 2980)
print_lines(4195, 4215)
