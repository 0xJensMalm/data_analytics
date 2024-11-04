#!/usr/local/bin/python3

import os
import inquirer
import pyperclip

def display_ascii_title():
    title = r"""
  _______  
 /       \
/   >     \
\_________/
    """
    print(title)

def get_folder_path():
    while True:
        folder_path = input("Input folder path: ")
        if os.path.isdir(folder_path):
            return folder_path
        else:
            print("Invalid folder path. Please try again.")

def select_initial_file_types():
    initial_file_types = ['html', 'js', 'tsx', 'css', 'json', 'ts']
    questions = [
        inquirer.Checkbox('file_types',
                          message="Select file types",
                          choices=initial_file_types,
                          default=initial_file_types)
    ]
    answers = inquirer.prompt(questions)
    return answers['file_types']

def list_files(folder_path, file_types, exclusions=None):
    folder_structure = []
    for root, dirs, files in os.walk(folder_path):
        dirs[:] = [d for d in dirs if os.path.relpath(os.path.join(root, d), folder_path) not in exclusions]
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, folder_path)

            if exclusions and (relative_path in exclusions or os.path.dirname(relative_path) in exclusions):
                continue

            if any(file.endswith(f".{ext}") for ext in file_types):
                folder_structure.append(relative_path)

    return sorted(folder_structure)

def display_folder_structure(folder_structure):
    print("\n===== Included Files =====")
    for file in folder_structure:
        print(file)
    print("\n==========================\n")

def generate_plain_text_output(folder_structure, folder_path, file_types, exclusions):
    output = "===== Project Folder Structure =====\n\n"
    output += "\n".join(folder_structure)
    output += "\n\n===== Project Files =====\n\n"

    for file_path in folder_structure:
        full_file_path = os.path.join(folder_path, file_path)
        output += f"{file_path}\n\n"
        with open(full_file_path, 'r') as f:
            output += f.read() + "\n\n"

    return output

def generate_xml_output(folder_structure, folder_path, file_types, exclusions):
    output = "<Project>\n"

    output += "  <FolderStructure>\n"
    for file_path in folder_structure:
        directory = os.path.dirname(file_path)
        file = os.path.basename(file_path)
        output += f'    <Directory name="{directory}">\n'
        output += f"      <File>{file}</File>\n"
        output += "    </Directory>\n"
    output += "  </FolderStructure>\n"

    output += "  <FilesContent>\n"
    for file_path in folder_structure:
        full_file_path = os.path.join(folder_path, file_path)
        output += f'    <File name="{os.path.basename(file_path)}" path="{file_path}">\n'
        output += "      <![CDATA[\n"
        with open(full_file_path, 'r') as f:
            output += f.read()
        output += "\n      ]]>\n"
        output += "    </File>\n"
    output += "  </FilesContent>\n"

    output += "</Project>"
    return output

def exclude_unrelated_files():
    unrelated_folders = ['.next', 'node_modules', 'package-lock.json']
    questions = [
        inquirer.Confirm('exclude_unrelated', message="Exclude dependencies like node_modules and .next?", default=True)
    ]
    answers = inquirer.prompt(questions)
    if answers['exclude_unrelated']:
        return set(unrelated_folders)
    return set()

def exclude_additional_files_or_folders(folder_structure):
    questions = [
        inquirer.Checkbox('exclusions',
                          message="Select files or folders to exclude",
                          choices=folder_structure)
    ]
    answers = inquirer.prompt(questions)
    return set(answers['exclusions'])

def copy_to_clipboard(output):
    pyperclip.copy(output)
    print("Output copied to clipboard.")

def main():
    display_ascii_title()
    folder_path = get_folder_path()

    while True:
        file_types = select_initial_file_types()

        exclusions = exclude_unrelated_files()

        folder_structure = list_files(folder_path, file_types, exclusions)

        questions = [
            inquirer.Confirm('exclude_more', message="Exclude more files/folders?", default=False)
        ]
        answers = inquirer.prompt(questions)
        if answers['exclude_more']:
            exclusions.update(exclude_additional_files_or_folders(folder_structure))
            folder_structure = list_files(folder_path, file_types, exclusions)

        display_folder_structure(folder_structure)

        questions = [
            inquirer.Confirm('proceed', message="Proceed with the current collection?", default=True)
        ]
        answers = inquirer.prompt(questions)
        if answers['proceed']:
            break

    questions = [
        inquirer.List('output_format',
                      message="Select output format",
                      choices=['Plain Text', 'XML'])
    ]
    answers = inquirer.prompt(questions)
    output_format = answers['output_format']

    if output_format == 'Plain Text':
        output = generate_plain_text_output(folder_structure, folder_path, file_types, exclusions)
    else:
        output = generate_xml_output(folder_structure, folder_path, file_types, exclusions)

    print(output)

    while True:
        questions = [
            inquirer.Confirm('copy', message="Copy to clipboard?", default=True)
        ]
        answers = inquirer.prompt(questions)
        if answers['copy']:
            copy_to_clipboard(output)

        questions = [
            inquirer.Confirm('repeat', message="Copy from the same codebase again?", default=False)
        ]
        answers = inquirer.prompt(questions)
        if not answers['repeat']:
            print("Exiting script.")
            break

if __name__ == "__main__":
    main()
