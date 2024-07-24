import pdfplumber

def load_pdf(file_path):

    with pdfplumber.open(file_path) as pdf:
        content = ''
        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            print('------------------')

            # print(page.extract_text())
            # break
            page_content = '\n'.join(page.extract_text().split('\n')[:-1])
            content = content + page_content
    print(content)
    return content

if __name__=="__main__":

    file_path = 'test.pdf'
    all_content = load_pdf(file_path)


