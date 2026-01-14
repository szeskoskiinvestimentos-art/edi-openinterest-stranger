param(
  [string]$Root = "c:\Users\ednil\Downloads\Gamma\Edi_OpenInterest\exports"
)

$files = @(
  "Figura3.html","Figura4.html","Fluxo_Hedge.html","Dealer_Pressure.html","Gamma_Flip_Cone.html",
  "Charm_Flow.html","Vanna_Sensitivity.html","Pin_Risk.html","Rails_Bounce.html","Gamma_Exposure_Curve.html","Expiry_Pressure.html"
)

$fail = $false
foreach($f in $files){
  $path = Join-Path $Root $f
  if(!(Test-Path $path)){
    Write-Host "[ERRO] Não encontrado: $f" -ForegroundColor Red
    $fail = $true; continue
  }
  $html = Get-Content -Raw -Path $path
  if($html -notmatch "help.js"){
    Write-Host "[ERRO] Falta help.js em: $f" -ForegroundColor Red
    $fail = $true
  }
  if($html -notmatch "helpTabs"){
    Write-Host "[ERRO] Falta estrutura de abas em: $f" -ForegroundColor Red
    $fail = $true
  }
  else{
    Write-Host "[OK] $f possui help.js e abas" -ForegroundColor Green
  }
}

if($fail){ exit 1 } else { exit 0 }
