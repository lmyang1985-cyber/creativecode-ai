async function genBgr() {
  if(!curBgrFile)return showErr('bE','Please upload an image first.');
  const cost=1;
  hideNC('bNC'); hideErr('bE');
  if(!canUse(cost))return showNC('bNC');
  setBtn('bBtn',true,'');
  document.getElementById('bLdr').style.display='flex';
  document.getElementById('bOut').classList.add('on');
  curBgr=null;
  const old=document.getElementById('bBox').querySelector('img');if(old)old.remove();
  try {
    const reader = new FileReader();
    const base64 = await new Promise(r=>{reader.onload=e=>r(e.target.result);reader.readAsDataURL(curBgrFile);});
    const res=await fetch('/api/remove-background',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:base64,format:document.getElementById('bFmt').value})});
    const d=await res.json();
    if(!res.ok)throw new Error(d.error||'Failed');
    curBgr=d.image;
    document.getElementById('bLdr').style.display='none';
    const box=document.getElementById('bBox');
    const img=document.createElement('img');img.src=curBgr;img.style.borderRadius='12px';box.appendChild(img);
    if(!isPro)save(creds-cost);
  } catch(e){
    document.getElementById('bLdr').style.display='none';
    document.getElementById('bOut').classList.remove('on');
    showErr('bE',e.message);
  } finally {
    setBtn('bBtn',false,'Remove Background','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>');
  }
}
