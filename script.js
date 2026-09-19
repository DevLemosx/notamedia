(function(){
  var META = 28, N = 4;
  var sheet = document.getElementById('sheet');
  var somaEl = document.getElementById('soma');
  var result = document.getElementById('result');
  var modes = document.getElementById('modes');
  var mFalta = document.getElementById('mFalta');
  var mFinal = document.getElementById('mFinal');
  var mode = 'falta';
 
  for (var i = 1; i <= N; i++){
    var row = document.createElement('div');
    row.className = 'row';
    row.innerHTML =
      '<span class="tag">N' + i + '</span>' +
      '<span class="field"><input type="text" inputmode="decimal" autocomplete="off" ' +
        'placeholder="0,0" aria-label="Nota ' + i + '" data-i="' + i + '"></span>' +
      '<label class="skip"><input type="checkbox" data-skip="' + i + '"> não tenho</label>';
    sheet.appendChild(row);
  }
 
  var inputs = [].slice.call(sheet.querySelectorAll('input[data-i]'));
  var skips = [].slice.call(sheet.querySelectorAll('input[data-skip]'));
 
  function num(v){
    var n = parseFloat(String(v).replace(',', '.').trim());
    return isFinite(n) ? n : null;
  }
  function fmt(n){
    return n.toLocaleString('pt-BR', {minimumFractionDigits:0, maximumFractionDigits:2});
  }
 
  function read(){
    var got = [], missing = 0, soma = 0, invalid = false;
    inputs.forEach(function(inp, idx){
      var row = inp.closest('.row');
      var skipped = skips[idx].checked;
      inp.disabled = skipped;
      row.classList.toggle('off', skipped);
      if (skipped){ missing++; return; }
      var v = num(inp.value);
      if (v === null){ missing++; return; }
      if (v < 0 || v > 10) invalid = true;
      got.push(v); soma += v;
    });
    return {soma:soma, missing:missing, got:got.length, invalid:invalid};
  }
 
  function render(){
    var s = read();
    somaEl.textContent = fmt(s.soma);
    modes.hidden = !(s.missing > 0 && s.got > 0);
 
    var media4 = s.soma / N;
    var falta = META - s.soma;
    var final = 14 - media4;
    var html = '';
 
    if (s.got === 0){
      html = '<p class="verdict">Digite pelo menos uma nota para começar.</p>';
    } else if (s.missing === 0){
      if (s.soma >= META){
        html =
          '<p class="verdict">Fechou.</p>' +
          '<div class="big is-pass">' + fmt(s.soma) + ' pontos</div>' +
          '<p class="detail">Média ' + fmt(media4) + '. Você passou direto, sem final.</p>';
      } else {
        html =
          '<p class="verdict">Faltaram ' + fmt(falta) + ' pontos para os 28. Na prova final você precisa tirar</p>' +
          '<div class="big">' + fmt(final) + '</div>' +
          '<p class="detail">Média ' + fmt(media4) + '. A final entra como <b>(média + nota da final) ÷ 2 = 7</b>.</p>' +
          (final > 10 ? '<p class="detail warn">Acima de 10 — com essa média a final não alcança.</p>' : '');
      }
    } else if (mode === 'falta'){
      var plural = s.missing > 1;
      if (falta <= 0){
        html =
          '<p class="verdict">Já garantido.</p>' +
          '<div class="big is-pass">28+</div>' +
          '<p class="detail">Com ' + fmt(s.soma) + ' pontos você já bateu a meta. Qualquer nota nas que faltam serve.</p>';
      } else {
        html =
          '<p class="verdict">Você precisa tirar mais</p>' +
          '<div class="big">' + fmt(falta) + '</div>' +
          '<p class="detail">no total, somando ' + (plural ? 'as ' + s.missing + ' notas que faltam' : 'a nota que falta') +
            '. Você tem ' + fmt(s.soma) + ' pontos, faltam ' + fmt(falta) + ' para 28.</p>';
      }
    } else {
      var mediaP = s.soma / N;
      var finalP = 14 - mediaP;
      if (mediaP >= 7){
        html =
          '<p class="verdict">Sem final.</p>' +
          '<div class="big is-pass">Passou</div>' +
          '<p class="detail">Média ' + fmt(mediaP) + ' já com as notas que faltam valendo 0.</p>';
      } else {
        html =
          '<p class="verdict">Se as ' + s.missing + ' notas que faltam forem 0, na final você precisa de</p>' +
          '<div class="big">' + fmt(finalP) + '</div>' +
          '<p class="detail">Média ficaria ' + fmt(mediaP) + ' (soma ' + fmt(s.soma) + ' ÷ 4).</p>' +
          (finalP > 10
            ? '<p class="detail warn">Acima de 10. Enquanto as outras notas não saírem, esse número não é o definitivo.</p>'
            : '');
      }
    }
 
    if (s.invalid){
      html += '<p class="detail warn">Tem nota fora do intervalo de 0 a 10.</p>';
    }
 
    html += '<p class="formula">Quanto falta = 28 − soma &nbsp;·&nbsp; Nota da final = 14 − (soma ÷ 4)</p>';
    result.innerHTML = html;
  }
 
  function setMode(m){
    mode = m;
    mFalta.setAttribute('aria-pressed', String(m === 'falta'));
    mFinal.setAttribute('aria-pressed', String(m === 'final'));
    render();
  }
 
  sheet.addEventListener('input', render);
  sheet.addEventListener('change', render);
  mFalta.addEventListener('click', function(){ setMode('falta'); });
  mFinal.addEventListener('click', function(){ setMode('final'); });
  document.getElementById('reset').addEventListener('click', function(){
    inputs.forEach(function(i){ i.value = ''; });
    skips.forEach(function(c){ c.checked = false; });
    setMode('falta');
    inputs[0].focus();
  });
 
  render();
})();