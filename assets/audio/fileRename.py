import os
files = os.listdir(".")
# 49
availble_file_names = "abcdefghijklmnopqrstuvwxyz" #

print("{")
for index in range(len(files)):
    filename = files[index]
    if filename.startswith("VEC3 Percussion "):
        print( availble_file_names[index-2] + ":", "\""+ filename + "\",")
        # new_filename = "a.aif" % index
        # # print(filename, index, new_filename)
        # os.rename(filename, new_filename)
print("}")