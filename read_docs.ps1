$word = New-Object -ComObject Word.Application
$word.Visible = $false

$doc1 = $word.Documents.Open("d:\4th sem\DAA\AlgoArena_InternPrompt.docx")
$doc1.Content.Text | Out-File -FilePath "d:\4th sem\DAA\intern_prompt.txt" -Encoding UTF8
$doc1.Close($false)

$doc2 = $word.Documents.Open("d:\4th sem\DAA\AlgoArena_Assignment_Document.docx")
$doc2.Content.Text | Out-File -FilePath "d:\4th sem\DAA\assignment_doc.txt" -Encoding UTF8
$doc2.Close($false)

$word.Quit()
