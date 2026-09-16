export interface EsewaFormPayload {
  formUrl: string;
  fields: Record<string, string>;
}

export function submitEsewaForm(payload: EsewaFormPayload) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = payload.formUrl;
  for (const [name, value] of Object.entries(payload.fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}