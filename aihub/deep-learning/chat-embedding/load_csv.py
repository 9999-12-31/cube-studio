

import csv
def load_csv(file_path):
    all_content=[]
    with open(file_path, newline="", encoding='utf-8') as csvfile:
        csv_reader = csv.DictReader(csvfile)  # type: ignore
        for i, row in enumerate(csv_reader):
            content = "\n".join(f"{k.strip()}: {v.strip()}" for k, v in row.items())
            print('---------------------')
            print(content)
            all_content.append(content)
    return all_content

if __name__=="__main__":
    import os
    file_path = 'cube-studio.csv'
    all_content = load_csv(file_path)
