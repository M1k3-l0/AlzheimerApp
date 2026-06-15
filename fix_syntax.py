import os
import re

def main():
    # Fix the weird format fontSize: '1.5000rem'rem'
    # Or fontSize: '1rem'rem'
    # Actually wait: The previous script did this:
    # return f"fontSize: '{rem_val:.4f}rem'".rstrip('0').rstrip('.') + "rem'"
    # So if rem_val was 1.5, it became `fontSize: '1.5000rem'`
    # The rstrip did nothing to `'` so it appended `rem'`. Result: `fontSize: '1.5000rem'rem'`
    # We want to replace `fontSize: '([\d.]+)rem'rem'` with `fontSize: '{float(\1)}rem'` but dropping extra zeros
    pattern1 = re.compile(r"fontSize:\s*'([\d.]+)rem'rem'")
    pattern2 = re.compile(r"font-size:\s*([\d.]+)remrem")
    
    def repl1(m):
        val = float(m.group(1))
        if val.is_integer():
            return f"fontSize: '{int(val)}rem'"
        return f"fontSize: '{val:g}rem'"
        
    def repl2(m):
        val = float(m.group(1))
        if val.is_integer():
            return f"font-size: {int(val)}rem"
        return f"font-size: {val:g}rem"

    matches_count = 0
    for root, dirs, files in os.walk('l:/AlzheimerApp/src'):
        for f in files:
            path = os.path.join(root, f)
            if f.endswith('.jsx') or f.endswith('.js'):
                with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                    content = file.read()
                
                new_content, count = pattern1.subn(repl1, content)
                
                if count > 0:
                    matches_count += count
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print(f"Fixed {count} in {path}")
                    
            elif f.endswith('.css'):
                with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                    content = file.read()
                
                new_content, count = pattern2.subn(repl2, content)
                
                if count > 0:
                    matches_count += count
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print(f"Fixed {count} in {path} (CSS)")
                    
    print(f"Total fixed: {matches_count}")

if __name__ == '__main__':
    main()
