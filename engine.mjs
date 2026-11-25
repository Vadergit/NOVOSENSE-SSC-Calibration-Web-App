// Generic laboratory model, NOT a NOVOSENSE register encoding.
export function solve(points, p=1,t=0){
 if(!Number.isInteger(p)||p<1||p>3||!Number.isInteger(t)||t<0||t>2)throw Error('Ungültige Ordnung');
 const n=(p+1)*(t+1);
 if(points.length<n||points.some(q=>![q.raw,q.reference,...(t?[q.temp]:[])].every(Number.isFinite)))throw Error('Messmatrix unvollständig');
 const center=k=>points.reduce((a,q)=>a+q[k],0)/points.length;
 const x0=center('raw'), y0=t?center('temp'):0;
 const sx=Math.max(...points.map(q=>Math.abs(q.raw-x0))),sy=t?Math.max(...points.map(q=>Math.abs(q.temp-y0))):1;
 if(!sx||!sy||![sx,sy,x0,y0].every(Number.isFinite))throw Error('Keine unabhängige Messspanne');
 const basis=(raw,temp=0)=>Array.from({length:n},(_,k)=>((raw-x0)/sx)**(k%(p+1))*(t?((temp-y0)/sy)**Math.floor(k/(p+1)):1));
 const a=points.map(q=>basis(q.raw,q.temp)), b=points.map(q=>q.reference);
 // Modified Gram-Schmidt QR, with rank check.
 const cols=Array.from({length:n},(_,j)=>a.map(row=>row[j])), R=Array.from({length:n},()=>Array(n).fill(0)), Q=[];
 const dot=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0);
 for(let j=0;j<n;j++){let v=cols[j].slice();for(let i=0;i<j;i++){R[i][j]=dot(Q[i],v);v=v.map((x,k)=>x-R[i][j]*Q[i][k]);}R[j][j]=Math.sqrt(dot(v,v));if(R[j][j]<1e-9)throw Error('Messmatrix rangdefizient');Q.push(v.map(x=>x/R[j][j]));}
 const c=Array(n).fill(0);for(let j=n-1;j>=0;j--)c[j]=(dot(Q[j],b)-R[j].slice(j+1).reduce((s,x,k)=>s+x*c[j+1+k],0))/R[j][j];
 if(!c.every(Number.isFinite))throw Error('Numerischer Fehler');
 return {p,t,x0,y0,sx,sy,c};
}
export function predict(m,raw,temp=0){return m.c.reduce((s,c,k)=>s+c*((raw-m.x0)/m.sx)**(k%(m.p+1))*(m.t?((temp-m.y0)/m.sy)**Math.floor(k/(m.p+1)):1),0);}
export function verify(m,points,span,tolerance){if(!Number.isFinite(span)||span<=0||!Number.isFinite(tolerance)||tolerance<0||!points.length)throw Error('Ungültige Prüfparameter');return points.map(q=>{if(![q.raw,q.reference,...(m.t?[q.temp]:[])].every(Number.isFinite))throw Error('Prüfpunkt unvollständig');const actual=predict(m,q.raw,q.temp),error=100*(actual-q.reference)/span;return {...q,actual,error,pass:Number.isFinite(error)&&Math.abs(error)<=tolerance};});}
