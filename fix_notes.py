import os

# Caminho do arquivo
file_path = 'lib/noteService.ts'

# Ler o arquivo
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fazer as 3 substituições
content = content.replace(".select('id, name')", ".select('user_id, name')")
content = content.replace(".in('id', clientIds)", ".in('user_id', clientIds)")
content = content.replace("acc[client.id] = client.name", "acc[client.user_id] = client.name")

# Salvar o arquivo
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Arquivo atualizado com sucesso!")
print("Mudanças aplicadas:")
print("  1. .select('id, name') → .select('user_id, name')")
print("  2. .in('id', clientIds) → .in('user_id', clientIds)")  
print("  3. acc[client.id] → acc[client.user_id]")
