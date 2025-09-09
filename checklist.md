# Checklist - Próximos Passos

## Páginas e funcionalidades relacionadas aos documentos:

### DOCUMENTO "Avaliação experiência 1.doc":

- **"Nome"**:
  - ✅ Há uma opção de escolher um aluno cadastrado.

- **"Data da entrada"**:
  - ⚠️ Está como "data de envio", deve ser alterado para "Data da entrada".

- **"1ª Avaliação" (campo de data)**:
  - ⚠️ Necessário criar esse campo de data para que tenha tanto o "Data da entrada" quanto o "1a Avaliação". (A princípio, não devemos forçar que a data da avaliação seja a mesma data de envio do questionário virtual.)
  - ⚠️ Colocar um seletor que permita marcar a data como "1ª Avaliação" ou "2ª Avaliação" (não há necessidade de vinculação, pode ser um campo em separado próximo do campo de data, é só para distinção de formulários utilizando-se de mesma UI).

- **"Questionário"**:
  - ⚠️ As perguntas estão sem os asteriscos * e **. Adicionar.
  - ⚠️ Pergunta 47 inexistente. Criar (campo de texto).
  - ⚠️ Pergunta de um asterisco (*) inexistente. Criar (campo de texto).
  - ⚠️ Campo de dois asteriscos (**) (junto de "Observações") inexistente. Criar (campo de texto).

- **"Nome do professor(a)"**:
  - ✅ A princípio, desnecessário, pois já está vinculado ao login.
  
- **"Assinatura"**:
  - ✅ A princípio, desnecessário, pois já está vinculado ao login.

- **Extras**:
  - ❔ Colocar um modo de exportar para pdf e/ ou doc e/ou xls.
  - ❔ No documento exportado, colocar os dados complementares do instituto que já constam do documento, tais como: nome, endereço, cnpj, telefone, e-mail...

  ### DOCUMENTO "Avaliação experiência 2.doc":

- ✔️ USARÁ A MESMA PÁGINA DO DOCUMENTO "Avaliação experiência 2.doc", porém deve ser passível de escolher se é a primeira ou segunda avaliação.

- **"2ª Avaliação" (campo de data)**:
  - ⚠️ Este campo deve ser selecionável, alternando entre as opções "1ª Avaliação" e "2ª Avaliação".

## Design UX/UI:

- **Botão de retornar de cada página**:
  - ⚠️ O botão de retorno de cada página deve voltar para a página anterior da aplicação, ao invés de funcionar de forma idêntica ao botão "voltar" do navegador. Será necessário implementar uma chamada específica para o endereço de retorno, mesmo que a página não tenha sido visitada anteriormente. Isso é importante porque, ao acessar diretamente via URL, a função de retornar à página anterior do navegador fica sem sentido (pois pode voltar para uma página externa, como google.com).
