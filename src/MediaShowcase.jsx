import { useCallback, useMemo, useState } from 'react';
import { ArrowUpRight, Pause, Play, ArrowDown } from 'lucide-react';
import { photographs, certificates } from './media';
import { photoNotes, credentialGroups } from './journal-data';
import InfiniteSpiral from './InfiniteSpiral';
import CertificateReels from './CertificateReels';
import './media-showcase.css';
import ScrollChapter from './ScrollChapter';
import useMobileLayout from './useMobileLayout';

export default function MediaShowcase({ onOpen, galleryOpen }) {
  const mobile = useMobileLayout();
  const [expandedCertificates, setExpandedCertificates] = useState(false);
  const [photosPaused, setPhotosPaused] = useState(false);
  const [certsPaused, setCertsPaused] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [focusCommand, setFocusCommand] = useState(null);
  const [groupId, setGroupId] = useState('all');
  const onFocused = useCallback(index => setSelectedPhoto(index), []);
  const photo = photographs[selectedPhoto];
  const note = photoNotes[photo.id];
  const group = credentialGroups.find(item => item.id === groupId);
  const filteredCertificates = useMemo(() => certificates.filter(item => !group.ids || group.ids.includes(item.id)), [group]);
  const focusPhoto = index => { setSelectedPhoto(index); setPhotosPaused(true); setFocusCommand(previous => ({ index, key: (previous?.key ?? 0) + 1 })); };
  return <>
    <ScrollChapter id="photography"><section className="photography-section container" aria-labelledby="photography-title">
      <div className="photo-editorial"><div className="section-label"><span className="index">P</span><span>视觉记录 / PHOTOGRAPHY</span></div><p className="media-eyebrow mono">COLLECTING LIGHT / 09 ORIGINAL FRAMES</p><h2 id="photography-title">让日常，<br/><span className="muted-heading">有自己的轨道。</span></h2><p className="photo-description">把目光停留过的瞬间，<br/>收进一段流动的记忆。</p>
        <div className="photo-postcard"><button className="postcard-image" onClick={() => onOpen('photos', selectedPhoto)} aria-label={`放大摄影作品 ${photo.id}：${photo.title}`}><img src={photo.thumb} alt={photo.title}/><span><ArrowUpRight size={17}/> 看大图</span></button><div className="postcard-caption"><span className="mono">FRAME / {photo.id}</span><h3>{photo.title}</h3>{(note.location || note.date) && <p className="postcard-meta">{[note.location,note.date].filter(Boolean).join(' · ')}</p>}<p>{note.note || '把一个普通的瞬间，留在它原来的光里。'}</p></div></div>
        <div className="photo-index" aria-label="聚焦摄影作品">{photographs.map((item,index) => <button key={item.id} aria-label={`聚焦摄影作品 ${item.id}：${item.title}`} aria-pressed={index === selectedPhoto} onClick={() => focusPhoto(index)}><span className="mono">{item.id}</span><span>{item.title}</span><span className="photo-index-dot" aria-hidden="true"/></button>)}</div><div className="photo-controls"><button className="media-pause" onClick={() => setPhotosPaused(!photosPaused)} aria-label={photosPaused ? '播放摄影螺旋' : '暂停摄影螺旋'}>{photosPaused ? <Play size={13}/> : <Pause size={13}/>} {photosPaused ? '继续流动' : '暂停流动'}</button><span>选择编号停驻 · 拖动探索</span></div>
      </div>
      {mobile ? <div className="mobile-photo-collection"><div className="mobile-gallery-heading"><span className="mono">{photo.id} / 09</span><span>横滑选片 · 点击大图放大</span></div><div className="mobile-photo-filmstrip" aria-label="选择摄影作品">{photographs.map((item,index) => <button key={item.id} aria-pressed={index === selectedPhoto} aria-label={`选择摄影作品 ${item.id}：${item.title}`} onClick={() => focusPhoto(index)}><img src={item.thumb} alt="" loading="lazy"/><span className="mono">{item.id}</span></button>)}</div></div> : <div className="photo-spiral-panel"><span className="spiral-coordinate mono">A VISUAL ORBIT / SUN JIAWEI</span><InfiniteSpiral items={photographs} speed={.3} paused={photosPaused || galleryOpen} focusCommand={focusCommand} onFocused={onFocused} onSelect={index => onOpen('photos',index)}/><div className="spiral-bottom mono"><span>LIGHT IN MOTION</span><ArrowDown size={14}/><span>9 ORIGINAL FRAMES</span></div></div>}
    </section></ScrollChapter>
    <ScrollChapter id="certificates"><section className="certificates-section" aria-labelledby="certificates-title"><div className="container"><div className="section-label"><span className="index">C</span><span>持续学习 / CREDENTIALS</span></div><div className="certificates-heading"><div><p className="media-eyebrow mono">THE LEARNING NEVER STOPS / 17 RECORDS</p><h2 id="certificates-title">把好奇，<span className="muted-heading">变成积累。</span></h2></div><div className="certificate-introduction"><p>从编程基础到人工智能应用，<br/>每一张认证，都是一次向前的探索。</p><div className="certificate-controls"><button className="media-pause" onClick={() => setCertsPaused(!certsPaused)} aria-label={certsPaused ? '播放证书轮播' : '暂停证书轮播'}>{certsPaused ? <Play size={13}/> : <Pause size={13}/>} {certsPaused ? '继续轮播' : '暂停轮播'}</button><button onClick={() => onOpen('certificates',0)}>查看全部 17 张<ArrowUpRight size={14}/></button></div></div></div>
      <div className="credential-tabs" role="group" aria-label="证书类别">{credentialGroups.map(item => <button key={item.id} aria-pressed={groupId === item.id} onClick={() => { setGroupId(item.id); setExpandedCertificates(false); }}>{item.label}<span className="mono">{String(item.ids?.length ?? certificates.length).padStart(2,'0')}</span></button>)}<p>{group.description}</p></div>
    </div><div className="container certificate-reel-frame">{mobile ? <><div className="mobile-credential-grid">{filteredCertificates.slice(0, expandedCertificates ? undefined : 6).map(item => <button key={item.id} className="mobile-credential" onClick={() => onOpen('certificates',certificates.findIndex(record => record.id === item.id))} aria-label={`查看证书 ${item.id}：${item.title}`}><div><img src={item.thumb} alt="" loading="lazy"/><span className="mono">{item.id}</span></div><span>{item.title}</span><ArrowUpRight size={14}/></button>)}</div>{filteredCertificates.length > 6 && <button className="mobile-show-credentials" aria-expanded={expandedCertificates} onClick={() => setExpandedCertificates(!expandedCertificates)}>{expandedCertificates ? '收起证书' : `展开其余 ${filteredCertificates.length - 6} 张认证`}<ArrowDown size={15}/></button>}<p className="mobile-media-hint">轻触认证，查看完整证书</p></> : <><CertificateReels items={filteredCertificates} paused={certsPaused || galleryOpen} onSelect={index => onOpen('certificates',certificates.findIndex(item => item.id === filteredCertificates[index].id))}/><div className="certificate-reel-caption mono"><span>移动鼠标，让光落在学习的轨迹上。</span><span>SCROLL TO ACCELERATE / CLICK TO VIEW</span></div></>}</div></section></ScrollChapter>
  </>;
}
