{{- define "login-crud.name" -}}
login-crud
{{- end }}

{{- define "login-crud.fullname" -}}
{{ .Release.Name }}
{{- end }}
