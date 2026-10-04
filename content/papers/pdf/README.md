# 论文 PDF 文件

把论文的 PDF 放在这个文件夹里，文件名与 `content/publications.bib` 中的
**citation key**（即 `@ARTICLE{xxx, ...` 里的 `xxx`）保持一致、扩展名为 `.pdf`：

```
public/papers/pdf/<citationKey>.pdf
```

例如 `content/publications.bib` 中有：

```
@ARTICLE{dai2025multi, ... }
```

则把该论文的 PDF 命名为 `dai2025multi.pdf` 放到本目录，
站点会自动检测到文件并在该论文下显示 “PDF” 按钮（无需修改 .bib 文件）。
没有放入 PDF 的论文不会显示该按钮。

按钮只出现在首页 “Selected Publications” 的论文卡片上，Publications 页面不显示。

如果 PDF 在外部站点，也可以在 .bib 中显式指定（优先级高于本目录）：

```
pdfurl = {https://arxiv.org/pdf/2501.01234.pdf}
```

指定本目录内的其它文件名也可以：`pdf = {my-paper.pdf}`。
