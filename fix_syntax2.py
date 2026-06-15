import os
import re

def main():
    pattern1 = re.compile(r"fontSize:\s*'0rem'\.([\d]+)rem'")
    pattern2 = re.compile(r"fontSize:\s*'([\d]+)rem'\.([\d]+)rem'")
    pattern3 = re.compile(r"fontSize:\s*'([\d]+)rem'rem'")
    pattern4 = re.compile(r"fontSize:\s*'([\d]+)\.([\d]+)rem'rem'")

    matches_count = 0
    for root, dirs, files in os.walk('l:/AlzheimerApp/src'):
        for f in files:
            path = os.path.join(root, f)
            if f.endswith('.jsx') or f.endswith('.js'):
                with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                    content = file.read()
                
                # replace '0rem'.875rem' with '0.875rem'
                new_content, count = pattern1.subn(r"fontSize: '0.\1rem'", content)
                new_content, count2 = pattern2.subn(r"fontSize: '\1.\2rem'", new_content)
                new_content, count3 = pattern3.subn(r"fontSize: '\1rem'", new_content)
                new_content, count4 = pattern4.subn(r"fontSize: '\1.\2rem'", new_content)
                
                if count > 0 or count2 > 0 or count3 > 0 or count4 > 0:
                    matches_count += (count + count2 + count3 + count4)
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print(f'Fixed {count+count2+count3+count4} in {path}')
    print(f'Total fixed: {matches_count}')

if __name__ == '__main__':
    main()
