# Better Exporter

The goal of this script is to automate the export of layers of an Adobe Animate file. This exporter can scan  layers inside symbols and merge layers.

- *Guided* and *masked* layers are exported while *guide* and *mask* layers are not.

- Hidden layers are exported even if you unchecked include hidden layers in the publish settings.

- Tags you can use to tell the script what to export :

	- Add the tag `S_` before the **layer name** to make the exporter enter a **S**ymbol. The layer has to have only one symbol on it. For example this can be useful in the case of a layer with the symbol of a character and you want to enter it to export each of its own layers separately.
	- Add the tag `M_` in front of a **folder name**, to **M**erge the layers contained inside this folder.
	- If these letters don't suit your needs you can easily change them by opening the script, see lines 24 and 25.

- A folder is automatically created at the same path as the .fla file and with the same name. Exported files take the name of the layers, preceded by incremental numbers. This naming convention keep the right depth order. Therefore you can just drag and drop the exported folder into an After Effects composition to get the expected result.


### A few caveats

- Do not put a folder inside a M_Merged folder.
- Run the script only from the main timeline.

