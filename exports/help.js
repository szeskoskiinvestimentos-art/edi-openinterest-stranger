/* Contextual Help Injection */
(function(){
  function $(sel){return document.querySelector(sel)}

  var MAP = {
    'Open Interest por Strike': {
      'Ajuda didática': ['Leitura de OI por strike','Cores: CALL/PUT e acumulado','Clusters e mudanças de interesse'],
      'Exemplos de trade': ['Operar direção do aumento de OI','Evitar OI disperso','Combinar com flip/magneto'],
      'Alertas de risco': ['Atraso de OI','Falsos movimentos em baixa liquidez','Mudanças de série'],
      'Plano de Trade': ['Acima do ZGL: priorizar momentum e proteger contra gaps','Abaixo do ZGL: priorizar reversão e usar Max Pain/ZGL como limites','Marcar Max OI e ZGL no gráfico como zonas-alvo']
    },
    'Delta Agregado': {
      'Ajuda didática': ['Delta por strike','Sinal agregado','Referências SPOT/ZGL'],
      'Exemplos de trade': ['Operar direção do delta dominante','Usar ZGL como pivô','Evitar contra‑sinal sem confirmação'],
      'Alertas de risco': ['Mudanças de série deslocam sinal','Spikes de IV alteram regime','Baixa liquidez distorce leitura'],
      'Plano de Trade': ['Mapear faixa de delta dominante','Sincronizar entradas com regime','Ajustar alvo por ZGL/Max Gamma']
    },
    'Delta Acumulado': {
      'Ajuda didática': ['Curva acumulada de delta','Faixas de concentração','Transições de inclinação'],
      'Exemplos de trade': ['Buscar mudança de inclinação','Confirmar reversões por acumulação','Evitar operar em faixa plana'],
      'Alertas de risco': ['Acumulação mascarada por agregação','Dados incompletos mudam curva','IV dinâmica altera perfil'],
      'Plano de Trade': ['Usar inflexões para gatilho','Confirmar com GEX/ZGL','Calibrar risco por inclinação acumulada']
    },
    'Delta & GEX': {
      'Ajuda didática': ['Delta agregado e GEX','SPOT e zero gamma','GEX+: amortecer, GEX-: amplificar'],
      'Exemplos de trade': ['Comprar suporte com GEX+','Vender resistência com GEX+','Evitar contra‑tendência em GEX-'],
      'Alertas de risco': ['Regime muda no vencimento','Spikes de IV','Baixa liquidez'],
      'Plano de Trade': ['Identificar ZGL e Max Gamma ± como pivôs','Acima do ZGL: cenário acelerador, buscar breakouts','Abaixo do ZGL: cenário freio, operar faixas e reversão']
    },
    'Gamma Exposure': {
      'Ajuda didática': ['Exposição total de gamma','Curvatura acumulada','Interação com SPOT/flip'],
      'Exemplos de trade': ['Operar paredes de GEX','Evitar contra curvatura dominante','Usar flip como limite'],
      'Alertas de risco': ['Curvatura muda intradiário','Eventos deslocam paredes','Iliquidez amplia ruído'],
      'Plano de Trade': ['Mapear walls e zero gamma','Usar curvatura como filtro','Ajustar alvo por áreas dominantes']
    },
    'GEX & Flip': {
      'Ajuda didática': ['Modelos de Gamma Flip','Mistura α (0=OI,1=VOL)','Sensibilidade do flip à VOL'],
      'Exemplos de trade': ['Ajustar alvo por α','Reversão no cruzamento do SPOT','Usar α médio como baseline'],
      'Alertas de risco': ['Eventos aumentam peso de VOL','Mix muda por série','Dados incompletos'],
      'Plano de Trade': ['Usar flip como gatilho de regime','Calibrar α conforme eventos e liquidez','Alvos ajustados por flips dominantes']
    },
    'Fluxo Hedge': {
      'Ajuda didática': ['Fluxo vs ΔS','Slider para choques','Fricção por |fluxo|'],
      'Exemplos de trade': ['Evitar contra picos','Entrar pós dissipação','Scalp em baixo fluxo'],
      'Alertas de risco': ['Slippage em choques','Rebalanceio intradiário','Delta‑hedge altera microestrutura'],
      'Plano de Trade': ['Sincronizar entradas com dissipação do fluxo','Evitar contra choques elevados','Ajustar risco usando faixas do fluxo']
    },
    'Dealer Pressure': {
      'Ajuda didática': ['|gamma|, OI e distância','Picos de pressão','Modos balanced/gamma/distance'],
      'Exemplos de trade': ['Balanced para swing','Gamma para tático','Distance para alvo amplo'],
      'Alertas de risco': ['Pressão migra com SPOT','Maturidade altera pesos','OI defasado'],
      'Plano de Trade': ['Usar modo conforme horizonte (balanced/swing, gamma/tático)','Mapear faixas de maior pressão','Confirmar com regime de ZGL']
    },
    'Gamma Flip Cone': {
      'Ajuda didática': ['Flip vs OI/VOL','Robustez do flip','Leitura de dispersão'],
      'Exemplos de trade': ['Operar regime estável','Evitar cone disperso','Confirmar com GEX agregado'],
      'Alertas de risco': ['Sensível à IV','Eventos deslocam cone','Iliquidez gera ruído'],
      'Plano de Trade': ['Operar quando cone está compacto/estável','Usar flips como pivôs de alvo','Evitar operações em cones dispersos']
    },
    'Charm Flow': {
      'Ajuda didática': ['Charm por strike','Decaimento de tempo','Janelas por vencimento'],
      'Exemplos de trade': ['Operar desacelerações','Evitar rolagem contra fluxo','Combinar com vencimentos'],
      'Alertas de risco': ['Não linear perto do vencimento','Book altera charm','Shifts de IV'],
      'Plano de Trade': ['Ajustar posições com decaimento de tempo','Evitar rolagem contra o fluxo dominante','Sincronizar janelas por vencimento']
    },
    'Vanna': {
      'Ajuda didática': ['ΔΔ vs ΔIV','Slider para cenários','Inclinação = sensibilidade'],
      'Exemplos de trade': ['Ajustar risco à ΔIV','Hedge quando sobe','Selecionar tenores'],
      'Alertas de risco': ['ΔIV elevado','Skew altera resposta','IV com atraso'],
      'Plano de Trade': ['Usar ΔIV para calibrar hedge','Evitar exposição alta em ΔIV elevado','Selecionar tenores por sensibilidade']
    },
    'Pin Risk': {
      'Ajuda didática': ['Score: OI, |gamma|, distância','Picos ~ probabilidade de pin','Curto prazo'],
      'Exemplos de trade': ['Aproximação controlada','Evitar contra magneto','Fechar antes do vencimento'],
      'Alertas de risco': ['Gaps','Intervenções quebram magneto','Mudanças tardias de OI'],
      'Plano de Trade': ['Operar aproximações a picos de pin com cautela','Evitar contra magneto sem confirmação','Fechar antes do vencimento em alto risco']
    },
    'Rails & Bounce': {
      'Ajuda didática': ['Curvatura/acúmulo de GEX','Range, walls, zero gamma','Zonas operacionais'],
      'Exemplos de trade': ['Comprar rails inferiores','Vender rails superiores','Scalp em bounce'],
      'Alertas de risco': ['Rails movem com dados','Breakouts anulam bounce','Baixa liquidez amplia ranges'],
      'Plano de Trade': ['Operar bounce em rails com confirmação','Evitar operar contra rompimentos','Ajustar alvo às paredes de GEX']
    },
    'Expiry Pressure': {
      'Ajuda didática': ['Short/Mid/Long','Magnetização no vencimento','Ponderação por tempo'],
      'Exemplos de trade': ['Magneto short','Evitar contra pressões mid/long','Sincronizar rolagem'],
      'Alertas de risco': ['bdays','Rolagem desloca pressão','Dias não úteis'],
      'Plano de Trade': ['Usar magnetização próxima ao vencimento','Evitar operações contra pressões dominantes','Planejar rolagem conforme janelas de pressão']
    },
    'Exposure Curve': {
      'Ajuda didática': ['Área verde/vermelha','SPOT e flip','Transições de sinal'],
      'Exemplos de trade': ['Evitar contra sinal','Buscar transição','Flip como pivô'],
      'Alertas de risco': ['Inversão intradiária','Agregação oculta clusters','Dados incompletos'],
      'Plano de Trade': ['Evitar operar contra a área dominante','Usar flip como pivô de decisão','Confirmar transições com regime de ZGL']
    }
    ,
    'Charm Exposure': {
      'Ajuda didática': ['Charm por strike','Efeito tempo','Interação com vencimentos'],
      'Exemplos de trade': ['Ajustar posições ao decaimento','Evitar rolagem contra fluxo','Combinar com janelas'],
      'Alertas de risco': ['Não linear perto do vencimento','Book altera charm','Shifts de IV'],
      'Plano de Trade': ['Usar charm para timing','Evitar exposição em alta sensibilidade','Sincronizar com tenores dominantes']
    },
    'Vanna Exposure': {
      'Ajuda didática': ['Sensibilidade Δ a IV','Perfil por strike','Resposta a ΔIV'],
      'Exemplos de trade': ['Cobrir risco em ΔIV alto','Ajustar hedge com Vanna','Selecionar strikes por sensibilidade'],
      'Alertas de risco': ['ΔIV elevado muda regime','Skew altera resposta','Atraso de IV impacta leitura'],
      'Plano de Trade': ['Usar Vanna como filtro de risco','Calibrar tamanho pela sensibilidade','Evitar operar contra resposta dominante']
    },
    'Theta Exposure': {
      'Ajuda didática': ['Theta por strike','Decaimento de tempo (Dealer)','Interação com Gamma'],
      'Exemplos de trade': ['Vender Theta alto','Evitar comprar em Theta agressivo','Combinar com Gamma Positivo'],
      'Alertas de risco': ['Decaimento acelera no vencimento','Gamma alto inverte Theta','Volatilidade afeta prêmio'],
      'Plano de Trade': ['Usar Theta a favor em consolidações','Proteger posições longas em Theta alto','Monitorar aceleração temporal']
    },
    'Delta Flip Profile': {
      'Ajuda didática': ['Perfil de Delta Líquido','Ponto de Inversão (Flip)','Simulação de Spot'],
      'Exemplos de trade': ['Operar reversão no Flip','Confirmar tendência acima/abaixo do Flip','Usar perfil para calibrar hedge'],
      'Alertas de risco': ['Simulação baseada em modelo','Volatilidade altera curva','Liquidez afeta execução'],
      'Plano de Trade': ['Mapear ponto de flip como suporte/resistência','Ajustar exposição conforme inclinação do perfil','Evitar operar contra a tendência do perfil']
    },
    'Charm Acumulado': {
      'Ajuda didática': ['Acúmulo de charm','Faixas de desaceleração','Efeito integrado'],
      'Exemplos de trade': ['Operar desaceleração agregada','Evitar acumulação adversa','Sincronizar alvos'],
      'Alertas de risco': ['Acúmulo mascara detalhes','Tenores mudam perfil','Dados incompletos'],
      'Plano de Trade': ['Usar inflexões acumuladas como gatilho','Confirmar com fluxo','Ajustar alvo por regime']
    },
    'Vanna Acumulado': {
      'Ajuda didática': ['Acúmulo de vanna','Inclinação integrada','Sinal agregado'],
      'Exemplos de trade': ['Evitar contra sinal agregado','Usar acumulação para direção','Combinar com GEX'],
      'Alertas de risco': ['ΔIV muda pressão agregada','Dados incompletos','Skew dinâmico'],
      'Plano de Trade': ['Operar a favor do sinal acumulado','Confirmar em áreas de GEX','Ajustar risco pela inclinação']
    },
    'Vega Exposure': {
      'Ajuda didática': ['Exposição a VOL por strike','Peso de VOL','Interação com regime'],
      'Exemplos de trade': ['Operar onde VOL pesa mais','Evitar contra pressão de VOL','Usar VOL para hedge'],
      'Alertas de risco': ['Eventos elevam VOL','Liquidez altera resposta','Atraso de dados'],
      'Plano de Trade': ['Calibrar risco pela VOL','Usar faixas de maior vega','Confirmar com flip/ZGL']
    },
    'Skew IV': {
      'Ajuda didática': ['Inclinação da IV','Assimetria por strike','Sinal local'],
      'Exemplos de trade': ['Evitar operar contra inclinação','Aproveitar assimetrias','Ajustar hedge por skew'],
      'Alertas de risco': ['Skew muda com eventos','Dados podem atrasar','Baixa liquidez distorce'],
      'Plano de Trade': ['Usar skew como filtro','Confirmar com sensibilidade','Evitar operar sem confirmação']
    }
  };

  function norm(s){
    return String(s||'').toLowerCase().replace(/\([^)]*\)/g,' ').replace(/[^a-z0-9ãâáàéêíóôõúç\s]/g,' ').replace(/\s+/g,' ').trim();
  }
  function pick(label, title){
    var nl = norm(label);
    var nt = norm(title.replace(/^edi\s+\u2014\s+/i,''));
    var best = ''; var score = -1;
    Object.keys(MAP).forEach(function(k){
      var nk = norm(k);
      var words = nk.split(' ');
      var re = new RegExp(words.map(function(w){return w.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&');}).join('.*?'));
      var s = 0;
      if(re.test(nl)) s += 3;
      if(re.test(nt)) s += 2;
      if(nl.indexOf(nk)>=0) s += 2;
      if(nt.indexOf(nk)>=0) s += 1;
      if(s > score){ score = s; best = k; }
    });
    return best || 'Delta & GEX';
  }

  function getContainers(){
    return {
      c: document.getElementById('helpTabs'),
      btns: document.getElementById('helpTabButtons'),
      cont: document.getElementById('helpTabContent')
    };
  }
  function renderKey(key){
    var refs = getContainers();
    if(!refs.btns || !refs.cont) return;
    var active = refs.btns.querySelector('button.active');
    var tab = active ? active.getAttribute('data-title') : (refs.btns.children[0] ? refs.btns.children[0].getAttribute('data-title') : 'Ajuda didática');
    var list = (MAP[key]||{})[tab] || [];
    refs.cont.innerHTML = '<ul style="margin:0;padding-left:18px">' + list.map(function(i){return '<li style="margin:6px 0">'+i+'</li>'}).join('') + '</ul>';
  }

  var MAP_OVERRIDES = {
    'GEX & Flip': {
      'Assinado + flips': {
        'Ajuda didática': ['Mistura por presets','Comparar flips visuais','Leitura: preset muda alvo'],
        'Exemplos de trade': ['Escolher preset compatível com regime','Ajustar alvo por preset','Usar PVOP quando aplicável'],
        'Alertas de risco': ['Preset não é universal','Eventos alteram melhor preset','Dados podem ocultar dispersões']
      },
      'Assinado apenas': {
        'Ajuda didática': ['Foco no GEX assinado','Sem flips adicionais','Leitura direta'],
        'Exemplos de trade': ['Operar suporte/resistência pelo GEX','Evitar contra‑sinal','Usar zero como pivô'],
        'Alertas de risco': ['Sensível à agregação','IV dinâmica altera resposta','Baixa liquidez distorce']
      }
    },
    'Dealer Pressure': {
      'Balanced': {
        'Ajuda didática': ['Peso igual |gamma| e distância','Visão equilibrada','Picos sugerem pressão'],
        'Exemplos de trade': ['Swing com balanced','Convergência gradual','Complementar com magneto'],
        'Alertas de risco': ['Migração com SPOT','Séries mudam pesos','OI defasado']
      },
      'Gamma-focused': {
        'Ajuda didática': ['Ênfase no |gamma|','Resposta tática','Curto prazo'],
        'Exemplos de trade': ['Operações rápidas em picos de gamma','Scalp de curta duração','Ajuste fino por fluxo'],
        'Alertas de risco': ['Volatilidade alta muda regime','Sinais falsos em baixa liquidez','Precisa confirmação']
      },
      'Distance-focused': {
        'Ajuda didática': ['Ênfase em distância ao SPOT','Faixas amplas','Direção'],
        'Exemplos de trade': ['Alvo amplo por distância','Movimentos tendenciais','Sincronizar com vencimentos'],
        'Alertas de risco': ['Distância muda com SPOT','Cuidado com gaps','Intervenções deslocam alvo']
      }
    }
  };

  function getActiveUpdateMenuLabel(){
    try {
      var gd = document.querySelector('.plotly-graph-div');
      var ums = gd && gd._fullLayout && gd._fullLayout.updatemenus;
      if(ums && ums.length){
        for(var i=0;i<ums.length;i++){
          var um = ums[i];
          var idx = um && um.active;
          var btns = um && um.buttons || [];
          if(typeof idx === 'number' && btns[idx] && btns[idx].label){
            var lbl = btns[idx].label;
            var nc = norm(lbl);
            var known = {};
            Object.keys(MAP).forEach(function(k){ known[norm(k)] = k; });
            Object.keys(MAP_OVERRIDES).forEach(function(panel){
              Object.keys(MAP_OVERRIDES[panel]).forEach(function(l){ known[norm(l)] = l; });
            });
            if(known[nc]) return known[nc];
            return lbl;
          }
        }
      }
      var svg = document.querySelector('svg');
      if(!svg) return '';
      var texts = svg.querySelectorAll('text, tspan');
      var candidates = [];
      for(var i=0;i<texts.length;i++){
        var s = (texts[i].textContent||'').trim();
        if(s && s.length <= 64) candidates.push(s);
      }
      var known = {};
      Object.keys(MAP).forEach(function(k){ known[norm(k)] = k; });
      Object.keys(MAP_OVERRIDES).forEach(function(panel){
        Object.keys(MAP_OVERRIDES[panel]).forEach(function(lbl){ known[norm(lbl)] = lbl; });
      });
      for(var j=0;j<candidates.length;j++){
        var c = candidates[j];
        var nc = norm(c);
        if(known[nc]) return known[nc];
      }
      return '';
    } catch(e){ return ''; }
  }

  function getPlotTitle(){
    try {
      var svg = document.querySelector('svg');
      if(!svg) return '';
      var texts = svg.querySelectorAll('text, tspan');
      var cand = [];
      for(var i=0;i<texts.length;i++){
        var s = (texts[i].textContent||'').trim();
        if(!s) continue;
        cand.push(s);
      }
      // Prefer strings que contenham 'EDI' ou casem alguma chave de MAP
      var keys = Object.keys(MAP);
      for(var j=0;j<cand.length;j++){
        var t = cand[j];
        for(var k=0;k<keys.length;k++){
          var name = keys[k];
          if(pick('', t) === name) return t;
        }
        if(/^edi\s+\u2014\s+/i.test(t)) return t;
      }
      return '';
    } catch(e){ return ''; }
  }

  function apply(){
    var refs = getContainers();
    if(!refs.btns || !refs.cont) return;
    
    // Check manual override
    var man = document.getElementById('manualHelpSelector');
    if(man && man.value) {
        // If manual value is set, do not auto-detect
        return; 
    }
    
    var sel = document.querySelector('select:not(#manualHelpSelector)');
    var v = sel ? (sel.options[sel.selectedIndex].text || sel.value) : '';
    var plotTitle = getPlotTitle() || document.title || '';
    var key = pick(v, plotTitle);
    var overrideLabel = getActiveUpdateMenuLabel() || getViewLabelFromTraces();
    if(overrideLabel && MAP[overrideLabel]){
      var active = refs.btns.querySelector('button.active');
      var tab = active ? active.getAttribute('data-title') : (refs.btns.children[0] ? refs.btns.children[0].getAttribute('data-title') : 'Ajuda didática');
      var list = (MAP[overrideLabel][tab]||[]);
      refs.cont.innerHTML = '<ul style="margin:0;padding-left:18px">' + list.map(function(i){return '<li style="margin:6px 0">'+i+'</li>'}).join('') + '</ul>';
      return;
    }
    if(overrideLabel && MAP_OVERRIDES[key] && MAP_OVERRIDES[key][overrideLabel]){
      var ov = MAP_OVERRIDES[key][overrideLabel];
      var active = refs.btns.querySelector('button.active');
      var tab = active ? active.getAttribute('data-title') : (refs.btns.children[0] ? refs.btns.children[0].getAttribute('data-title') : 'Ajuda didática');
      var list = (ov[tab]||[]);
      refs.cont.innerHTML = '<ul style="margin:0;padding-left:18px">' + list.map(function(i){return '<li style="margin:6px 0">'+i+'</li>'}).join('') + '</ul>';
      return;
    }
    renderKey(key);
  }

  

  function bind(){
    var refs = getContainers();
    if(!refs.c || !refs.btns || !refs.cont) return false;
    if(refs.c.getAttribute('data-help-bound')==='1') return true;
    refs.c.setAttribute('data-help-bound','1');
    
    // Inject manual topic selector
    var selContainer = document.createElement('div');
    selContainer.style.marginTop = '10px';
    selContainer.style.marginBottom = '10px';
    selContainer.innerHTML = '<span style="font-size:12px;color:#9ca3af;margin-right:8px">Tópico de Ajuda:</span>';
    var sel = document.createElement('select');
    sel.id = 'manualHelpSelector';
    sel.style.background = '#1f2937';
    sel.style.color = '#e5e7eb';
    sel.style.border = '1px solid #374151';
    sel.style.borderRadius = '4px';
    sel.style.padding = '4px 8px';
    
    var optAuto = document.createElement('option');
    optAuto.value = '';
    optAuto.text = '(Automático)';
    sel.appendChild(optAuto);
    
    Object.keys(MAP).forEach(function(k){
      var opt = document.createElement('option');
      opt.value = k;
      opt.text = k;
      sel.appendChild(opt);
    });
    
    sel.addEventListener('change', function(){
      var val = sel.value;
      if(val){
        // Manual mode
        refs.c.setAttribute('data-manual-mode', '1');
        renderKey(val);
      } else {
        // Auto mode
        refs.c.removeAttribute('data-manual-mode');
        apply();
      }
    });
    
    selContainer.appendChild(sel);
    // Insert before content, after bar
    refs.c.insertBefore(selContainer, refs.cont);

    var needed = ['Ajuda didática','Exemplos de trade','Alertas de risco','Plano de Trade'];
    needed.forEach(function(t){
      var exists = false;
      Array.prototype.forEach.call(refs.btns.children, function(x){ if(x.getAttribute('data-title')===t) exists=true; });
      if(!exists){
        var b = document.createElement('button');
        b.textContent = t;
        b.setAttribute('data-title', t);
        b.addEventListener('click', function(){ 
            Array.prototype.forEach.call(refs.btns.children, function(x){ x.classList.remove('active') }); 
            b.classList.add('active'); 
            // If manual mode, keep current selection
            var man = document.getElementById('manualHelpSelector');
            if(man && man.value) renderKey(man.value);
            else apply(); 
        });
        refs.btns.appendChild(b);
      }
    });
    apply();
    var selPage = document.querySelector('select:not(#manualHelpSelector)');
    if(selPage){ selPage.addEventListener('change', apply); }
    Array.from(refs.btns.children).forEach(function(b){ 
        b.addEventListener('click', function(){
            // If manual mode, keep current selection
            var man = document.getElementById('manualHelpSelector');
            if(man && man.value) renderKey(man.value);
            else apply();
        }); 
    });
    return true;
  }

  function getViewLabelFromTraces(){
    try {
      var gd = document.querySelector('.plotly-graph-div');
      var data = (gd && (gd._fullData || gd.data)) || [];
      var vis = {};
      for(var i=0;i<data.length;i++){
        var tr = data[i]||{};
        var v = tr.visible;
        var nm = String(tr.name||'');
        var on = (v === true) || (typeof v === 'undefined');
        if(on) vis[nm] = true;
      }
      if(vis['CALL OI'] || vis['PUT OI'] || vis['-PUT OI']) return 'Open Interest por Strike';
      if(vis['Gamma Exposure'] && !vis['Delta Agregado']) return 'Exposure Curve';
      if(vis['Delta Agregado']) return 'Delta & GEX';
      return '';
    } catch(e){ return ''; }
  }
  var bound = bind();
  if(!bound){
    var bodyMo = new MutationObserver(function(){ bind(); });
    bodyMo.observe(document.body, { childList:true, subtree:true });
    setTimeout(bind, 300);
    setTimeout(bind, 800);
  }
  var svg = document.querySelector('svg');
  if(svg){
    var mo = new MutationObserver(function(){ apply(); });
    mo.observe(svg, { subtree:true, childList:true, characterData:true });
  }
  var gd = document.querySelector('.plotly-graph-div');
  if(gd && gd.addEventListener){
    gd.addEventListener('plotly_restyle', apply);
    gd.addEventListener('plotly_relayout', apply);
    gd.addEventListener('plotly_update', apply);
    gd.addEventListener('plotly_animated', apply);
  }
  var last = '';
  setInterval(function(){
    try {
      var lbl = getActiveUpdateMenuLabel() || '';
      var plotTitle = getPlotTitle() || document.title || '';
      var key = pick('', plotTitle);
      var sig = lbl+'|'+key;
      if(sig !== last){ last = sig; apply(); }
    } catch(e){}
  }, 600);
})();
