# Megan User App V4 — Turn by Turn Real

Frontend separado para o usuário final.

## Recursos
- GPS ao vivo pelo navegador
- mapa real com OpenStreetMap + Leaflet
- rota real via OSRM público
- instruções turn-by-turn
- voz usando Speech Synthesis
- abertura rápida no Google Maps e Waze

## Como rodar
```powershell
cd frontend-user
npm install
npm run dev
```

## Observações
- Para voz, o navegador precisa suportar Web Speech API.
- Para GPS, o navegador precisa de permissão de localização.
- O roteamento usa serviços públicos e depende da internet no navegador.
