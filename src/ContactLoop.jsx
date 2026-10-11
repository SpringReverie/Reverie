import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, Github, Mail, MessageCircle, Pause, Phone, Play } from 'lucide-react';
import { profile } from './data';
import LogoLoop from './LogoLoop';
import useMobileLayout from './useMobileLayout';

const contacts = [
  { id: '01', label: '微信', en: 'WECHAT', value: profile.wechat, icon: MessageCircle, hint: '从一句你好开始', copy: true },
  { id: '02', label: '邮箱', en: 'EMAIL', value: profile.email, icon: Mail, hint: '写下一点新的可能', href: `mailto:${profile.email}` },
  { id: '03', label: 'QQ', en: 'QQ', value: profile.qq, icon: MessageCircle, hint: '让灵感继续生长', copy: true },
  { id: '04', label: '电话', en: 'PHONE', value: profile.phone, icon: Phone, hint: '听见彼此的想法', href: `tel:${profile.phone}` },
  { id: '05', label: 'GitHub', en: 'GITHUB', value: 'SpringReverie', icon: Github, hint: '代码与持续探索', href: profile.github, external: true },
].filter(item => item.value);

export default function ContactLoop() {
  const mobile = useMobileLayout();
  const mobileList = useRef(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [request, setRequest] = useState(null);
  const [copied, setCopied] = useState(null);
  const [message, setMessage] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const step = direction => {
    if (mobile) {
      const index = (mobileIndex + direction + contacts.length) % contacts.length;
      const list = mobileList.current;
      if (list) list.scrollTo({ left: list.children[index].offsetLeft - list.children[0].offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return;
    }
    setPaused(true);
    setRequest(previous => ({ index: ((previous?.index ?? 0) + direction + contacts.length) % contacts.length, key: (previous?.key ?? 0) + 1 }));
  };
  async function copy(item) {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(item.value);
      setCopied(item.id);
      setMessage(`${item.label}已复制`);
    } catch { setCopied(null); setMessage(`请手动复制${item.label}：${item.value}`); }
    timer.current = setTimeout(() => { setCopied(null); setMessage(''); }, 3000);
  }
  const renderContact = (item, key) => {
      const Icon = item.icon;
      const clone = !key.startsWith('0-');
      const tabIndex = clone ? -1 : 0;
      const Value = item.copy ? 'button' : 'a';
      return <article key={item.id} className={`contact-note ${item.en === 'EMAIL' ? 'contact-note-email' : ''}`}>
        <div className="contact-note-top"><span className="mono">{item.id} / {item.en}</span><Icon size={17} strokeWidth={1.2}/></div>
        <Value className="contact-note-value" tabIndex={tabIndex} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} onClick={item.copy ? () => copy(item) : undefined} aria-label={item.copy ? `复制${item.label}：${item.value}` : `${item.label}：${item.value}`}>{item.value}</Value>
        <div className="contact-note-bottom"><span>{item.hint}</span>{item.copy ? <span className="contact-note-copy">{copied === item.id ? <Check size={14}/> : <Copy size={14}/>} {copied === item.id ? '已复制' : '点击复制'}</span> : <button tabIndex={tabIndex} onClick={() => copy(item)} aria-label={`复制${item.label}`} title={`复制${item.label}`}>{copied === item.id ? <Check size={15}/> : <Copy size={14}/>}</button>}{item.href && <ArrowUpRight className="contact-note-arrow" size={14}/>}</div>
      </article>;
  };
  return <div className="contact-loop-shell">
    <div className="contact-loop-heading"><span className="mono">FIVE WAYS / UNDER THE SAME SKY</span><div className="contact-loop-controls"><span>停驻，或让话题继续流动</span><button onClick={() => step(-1)} aria-label="上一个联系方式"><ChevronLeft size={16}/></button>{!mobile && <button onClick={() => setPaused(!paused)} aria-label={paused ? '播放联系方式轮播' : '暂停联系方式轮播'} aria-pressed={paused}>{paused ? <Play size={13}/> : <Pause size={13}/>}</button>}<button onClick={() => step(1)} aria-label="下一个联系方式"><ChevronRight size={16}/></button></div></div>
    {mobile ? <div ref={mobileList} className="mobile-contact-list" aria-label="联系方式，左右滑动浏览" onScroll={event => { const list = event.currentTarget; const distance = list.children[1]?.offsetLeft - list.children[0]?.offsetLeft; if (distance) setMobileIndex(Math.max(0, Math.min(contacts.length - 1, Math.round(list.scrollLeft / distance)))); }}>{contacts.map(item => renderContact(item, `0-${item.id}`))}</div> : <LogoLoop logos={contacts} speed={26} gap={18} paused={paused} focusRequest={request} pauseOnHover ariaLabel="联系方式，可暂停并使用左右按钮浏览" className="contact-loop" renderItem={renderContact}/>}
    {mobile && <div className="mobile-contact-position"><span className="mono">0{mobileIndex + 1} / 05</span><span>左右滑动，找到你习惯的方式</span></div>}
    <p className="contact-loop-status" role="status" aria-live="polite">{message}</p>
  </div>;
}
