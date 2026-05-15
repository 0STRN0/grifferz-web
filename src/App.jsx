import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, getIdTokenResult } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, query, where, orderBy, updateDoc, arrayUnion, arrayRemove, deleteDoc, increment, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKOab-7c6zzSy_ujC_AvCztdieruKm3UQ",
  authDomain: "grifferz-cc520.firebaseapp.com",
  projectId: "grifferz-cc520",
  storageBucket: "grifferz-cc520.firebasestorage.app",
  messagingSenderId: "623140091127",
  appId: "1:623140091127:web:ed98326018363c9a230ff2"
};

if (!getApps().length) { initializeApp(firebaseConfig); }
const auth = getAuth();
const db = getFirestore();

// Cores
const C = {
  bg: '#0a0a0a', prata: '#c0c0c0', prataEscuro: '#a0a0a0',
  roxo: '#7b2ff7', roxoClaro: '#9d4eff', branco: '#ffffff',
  card: '#111111', borda: '#1a1a1a', erro: '#ff2d55', sucesso: '#4caf50', amarelo: '#ffc107', laranja: '#ff9800',
};

// Estilos CSS-in-JS
const styles = {
  container: { maxWidth: '500px', margin: '0 auto', background: C.bg, minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' },
  header: { background: C.bg, padding: '20px 16px 10px', textAlign: 'center', borderBottom: `1px solid ${C.borda}` },
  logo: { color: C.prata, fontSize: '28px', fontWeight: '900', letterSpacing: '4px', margin: '0' },
  btn: { background: C.roxo, color: C.branco, border: 'none', padding: '14px 24px', borderRadius: '25px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%' },
  btnOutline: { background: 'transparent', color: C.erro, border: `1px solid ${C.erro}`, padding: '14px 24px', borderRadius: '25px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%' },
  input: { background: '#1a1a1a', color: C.branco, border: `1px solid ${C.borda}`, padding: '14px', borderRadius: '12px', fontSize: '14px', width: '100%', marginBottom: '10px', outline: 'none', boxSizing: 'border-box' },
  card: { background: C.card, borderRadius: '12px', padding: '16px', marginBottom: '12px', border: `1px solid ${C.borda}` },
  postImage: { width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
  avatarPequeno: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' },
  tabBar: { display: 'flex', justifyContent: 'space-around', background: C.bg, borderTop: `1px solid ${C.borda}`, padding: '12px 0', position: 'sticky', bottom: '0', zIndex: '10' },
  tab: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', background: 'none', border: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' },
  gridImage: { width: '100%', height: '130px', objectFit: 'cover', cursor: 'pointer' },
  produtoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', padding: '0 12px' },
  produtoCard: { background: C.card, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${C.borda}` },
  produtoImagem: { width: '100%', height: '150px', objectFit: 'cover' },
  storiesBar: { display: 'flex', gap: '12px', padding: '10px 16px', overflowX: 'auto' },
  story: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' },
  storyRing: { width: '60px', height: '60px', borderRadius: '50%', border: `2px solid ${C.roxo}`, objectFit: 'cover' },
  modal: { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '100' },
  modalContent: { background: C.card, borderRadius: '16px', padding: '20px', maxWidth: '400px', width: '90%', maxHeight: '80vh', overflowY: 'auto' },
  chip: { padding: '8px 16px', borderRadius: '20px', background: C.card, border: `1px solid ${C.borda}`, color: C.prataEscuro, fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  chipAtivo: { background: C.roxo, color: C.branco, border: `1px solid ${C.roxo}` },
};

export default function App() {
  const [carregando, setCarregando] = useState(true);
  const [logado, setLogado] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [modo, setModo] = useState('login');
  const [tipo, setTipo] = useState('cliente');
  const [nomeMarca, setNomeMarca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('home');
  const [usuario, setUsuario] = useState(null);
  const [timelinePosts, setTimelinePosts] = useState([]);
  const [drops, setDrops] = useState([]);
  const [meusPosts, setMeusPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [modalOpen, setModalOpen] = useState(null);
  const [novoPostImg, setNovoPostImg] = useState('');
  const [novoPostDesc, setNovoPostDesc] = useState('');
  const [novoProdutoNome, setNovoProdutoNome] = useState('');
  const [novoProdutoPreco, setNovoProdutoPreco] = useState('');
  const [novoProdutoImg, setNovoProdutoImg] = useState('');
  const [likedPosts, setLikedPosts] = useState({});
  const [seguindo, setSeguindo] = useState([]);
  const [todasMarcas, setTodasMarcas] = useState([]);
  const [searchzQuery, setSearchzQuery] = useState('');
  const [postAmpliado, setPostAmpliado] = useState(null);
  const [collabMarcas, setCollabMarcas] = useState([]);

  const podePostar = () => usuario?.tipo === 'marca_aprovada' || usuario?.role === 'admin';

  useEffect(() => { carregarTodosDados(); }, [logado]);

  const carregarTodosDados = async () => {
    try {
      const snapPosts = await getDocs(query(collection(db, 'posts'), orderBy('criadoEm', 'desc')));
      const listaPosts = []; snapPosts.forEach(doc => listaPosts.push({ id: doc.id, ...doc.data() }));
      setTimelinePosts(listaPosts);

      const snapDrops = await getDocs(collection(db, 'drops'));
      const listaDrops = []; snapDrops.forEach(doc => listaDrops.push({ id: doc.id, ...doc.data() }));
      setDrops(listaDrops);

      if (podePostar()) {
        const snapMeus = await getDocs(query(collection(db, 'posts'), where('marcaId', '==', usuario.uid), orderBy('criadoEm', 'desc')));
        const listaMeus = []; snapMeus.forEach(doc => listaMeus.push({ id: doc.id, ...doc.data() }));
        setMeusPosts(listaMeus);
      }

      const snapTodas = await getDocs(query(collection(db, 'usuarios'), where('tipo', '==', 'marca_aprovada')));
      const listaTodas = []; snapTodas.forEach(doc => listaTodas.push({ id: doc.id, ...doc.data() }));
      setTodasMarcas(listaTodas);
      setCollabMarcas(listaTodas);
    } catch (e) { console.log(e); }
  };

  const handleCadastro = async () => {
    setErro('');
    if (!email.trim() || !senha.trim()) { setErro('Preencha todos!'); return; }
    if (senha.length < 6) { setErro('Senha: 6+ caracteres!'); return; }
    if (senha !== confirmarSenha) { setErro('Senhas não conferem!'); return; }
    setLoading(true);
    try {
      const uc = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      const data = { email: email.trim(), tipo: tipo === 'marca' ? 'marca_pendente' : 'cliente', nome: tipo === 'marca' ? nomeMarca : email.split('@')[0], usuario: '@' + email.split('@')[0], bio: 'Novo no Grifferz', foto: 'https://picsum.photos/200?random=' + Math.floor(Math.random() * 1000), categoria: tipo === 'marca' ? (categoria || 'Moda') : '', status: tipo === 'marca' ? 'pendente' : 'aprovado', fotoCapa: null, seguidores: [], seguindo: [], criadoEm: new Date().toISOString() };
      await setDoc(doc(db, 'usuarios', uc.user.uid), data);
      setUsuario({ uid: uc.user.uid, ...data });
      setLogado(true); setTab('home');
    } catch (e) { setErro('Erro: ' + e.message); } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    setErro(''); if (!email.trim() || !senha.trim()) { setErro('Preencha todos!'); return; }
    setLoading(true);
    try {
      const uc = await signInWithEmailAndPassword(auth, email.trim(), senha);
      const ud = await getDoc(doc(db, 'usuarios', uc.user.uid));
      if (ud.exists()) {
        const data = { uid: uc.user.uid, ...ud.data(), role: 'user' };
        setUsuario(data); setLogado(true); setTab('home');
      }
    } catch (e) { setErro('Erro: ' + e.message); } finally { setLoading(false); }
  };

  const handleLogout = () => { signOut(auth); setLogado(false); setUsuario(null); };

  const publicarPost = async () => {
    if (!novoPostImg.trim() || !novoPostDesc.trim()) return;
    await addDoc(collection(db, 'posts'), { marcaId: usuario.uid, marcaNome: usuario.nome, marcaFoto: usuario.foto, imagens: [novoPostImg], desc: novoPostDesc, tipo: 'normal', likes: 0, comments: [], reposts: 0, data: 'Agora', criadoEm: new Date().toISOString() });
    setModalOpen(null); setNovoPostImg(''); setNovoPostDesc('');
    carregarTodosDados();
  };

  const adicionarProduto = async () => {
    if (!novoProdutoNome.trim() || !novoProdutoPreco.trim() || !novoProdutoImg.trim()) return;
    await addDoc(collection(db, 'drops'), { marcaId: usuario.uid, brand: usuario.nome, name: novoProdutoNome, price: 'R$ ' + novoProdutoPreco, images: [novoProdutoImg], descricao: '', tags: [], tamanhos: [], criadoEm: new Date().toISOString() });
    setModalOpen(null); setNovoProdutoNome(''); setNovoProdutoPreco(''); setNovoProdutoImg('');
    carregarTodosDados();
  };

  const handleLike = async (postId) => {
    const ref = doc(db, 'posts', postId);
    const post = timelinePosts.find(p => p.id === postId);
    if (!post) return;
    await updateDoc(ref, { likes: likedPosts[postId] ? post.likes - 1 : post.likes + 1 });
    setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
    setTimelinePosts(prev => prev.map(p => p.id === postId ? { ...p, likes: likedPosts[postId] ? p.likes - 1 : p.likes + 1 } : p));
  };

  const seguirUsuario = async (targetId) => {
    if (seguindo.includes(targetId)) {
      setSeguindo(prev => prev.filter(id => id !== targetId));
    } else {
      setSeguindo(prev => [...prev, targetId]);
    }
  };

  if (!logado) {
    return (
      <div style={styles.container}>
        <div style={{ padding: '60px 20px 20px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: C.roxo, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ color: C.branco, fontSize: '40px', fontWeight: '900' }}>G</span>
          </div>
          <h1 style={styles.logo}>GRIFFERZ</h1>
          <p style={{ color: C.prataEscuro, marginBottom: '30px', fontSize: '13px' }}>Marketplace Social de Marcas de Moda</p>

          <div style={{ display: 'flex', gap: '4px', background: C.card, borderRadius: '25px', padding: '4px', marginBottom: '20px' }}>
            <button onClick={() => setModo('login')} style={{ ...styles.btn, background: modo === 'login' ? C.roxo : 'transparent', color: modo === 'login' ? C.branco : C.prataEscuro, flex: 1 }}>Entrar</button>
            <button onClick={() => setModo('cadastro')} style={{ ...styles.btn, background: modo === 'cadastro' ? C.roxo : 'transparent', color: modo === 'cadastro' ? C.branco : C.prataEscuro, flex: 1 }}>Criar Conta</button>
          </div>

          {modo === 'cadastro' && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
              <button onClick={() => setTipo('cliente')} style={{ ...styles.chip, ...(tipo === 'cliente' ? styles.chipAtivo : {}) }}>👤 Cliente</button>
              <button onClick={() => setTipo('marca')} style={{ ...styles.chip, ...(tipo === 'marca' ? styles.chipAtivo : {}) }}>🏪 Marca</button>
            </div>
          )}
          {modo === 'cadastro' && tipo === 'marca' && (
            <>
              <input style={styles.input} placeholder="Nome da Marca" value={nomeMarca} onChange={e => setNomeMarca(e.target.value)} />
              <input style={styles.input} placeholder="Categoria" value={categoria} onChange={e => setCategoria(e.target.value)} />
            </>
          )}

          {erro && <p style={{ color: C.erro, textAlign: 'center', marginBottom: '15px', fontSize: '13px' }}>{erro}</p>}

          <input style={styles.input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
          <input style={styles.input} placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} type="password" />
          {modo === 'cadastro' && <input style={styles.input} placeholder="Confirmar Senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} type="password" />}

          <button style={styles.btn} onClick={modo === 'login' ? handleLogin : handleCadastro} disabled={loading}>
            {loading ? 'Carregando...' : modo === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Conteúdo */}
      <div style={{ paddingBottom: '60px' }}>
        {tab === 'home' && (
          <div>
            <div style={styles.header}><h1 style={styles.logo}>GRIFFERZ</h1></div>
            {stories.length > 0 && (
              <div style={styles.storiesBar}>
                {stories.map(story => (
                  <div key={story.id} style={styles.story}>
                    <img src={story.marcaFoto} style={styles.storyRing} alt="" />
                    <span style={{ color: C.prataEscuro, fontSize: '10px' }}>{story.marcaNome}</span>
                  </div>
                ))}
              </div>
            )}
            {drops.length > 0 && (
              <div style={{ ...styles.storiesBar, paddingBottom: '0' }}>
                {drops.slice(0,5).map(drop => (
                  <div key={drop.id} style={{ minWidth: '130px', ...styles.card, cursor: 'pointer' }} onClick={() => setTab('drops')}>
                    <img src={drop.images?.[0] || drop.image} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} alt="" />
                    <p style={{ color: C.roxoClaro, fontSize: '10px', marginTop: '8px' }}>{drop.brand}</p>
                    <p style={{ color: C.prata, fontSize: '11px' }}>{drop.name}</p>
                    <p style={{ color: C.sucesso, fontSize: '12px', fontWeight: '700' }}>{drop.price}</p>
                  </div>
                ))}
              </div>
            )}
            {timelinePosts.map(post => (
              <div key={post.id} style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <img src={post.marcaFoto || 'https://picsum.photos/32'} style={styles.avatarPequeno} alt="" />
                  <span style={{ color: C.prata, fontWeight: '700' }}>{post.marcaNome}</span>
                </div>
                <img src={post.imagens?.[0] || post.imagem || 'https://picsum.photos/400'} style={styles.postImage} alt="" />
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: likedPosts[post.id] ? C.erro : C.prata }}>♥</button>
                  <span style={{ color: C.prata, fontWeight: '700', fontSize: '13px' }}>{post.likes} curtidas</span>
                </div>
                <p style={{ color: C.prataEscuro, fontSize: '13px', marginTop: '4px' }}>{post.desc}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'drops' && (
          <div>
            <div style={styles.header}><h1 style={styles.logo}>Dropz 🔥</h1></div>
            {podePostar() && (
              <div style={{ padding: '0 16px', marginBottom: '10px' }}>
                <button style={styles.btn} onClick={() => setModalOpen('novoProduto')}>+ Novo Produto</button>
              </div>
            )}
            <div style={styles.produtoGrid}>
              {drops.map(item => (
                <div key={item.id} style={styles.produtoCard}>
                  <img src={item.images?.[0] || item.image} style={styles.produtoImagem} alt="" />
                  <div style={{ padding: '10px' }}>
                    <p style={{ color: C.roxoClaro, fontSize: '10px' }}>{item.brand}</p>
                    <p style={{ color: C.prata, fontSize: '13px', fontWeight: '700' }}>{item.name}</p>
                    <p style={{ color: C.sucesso, fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'searchz' && (
          <div>
            <div style={styles.header}><h1 style={styles.logo}>Searchz</h1></div>
            <div style={{ padding: '0 16px' }}>
              <input style={styles.input} placeholder="Buscar marcas..." value={searchzQuery} onChange={e => setSearchzQuery(e.target.value)} />
            </div>
            {todasMarcas.filter(m => m.nome?.toLowerCase().includes(searchzQuery.toLowerCase()) || m.usuario?.toLowerCase().includes(searchzQuery.toLowerCase())).map(marca => (
              <div key={marca.id} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '12px', margin: '0 16px 8px' }}>
                <img src={marca.foto || 'https://picsum.photos/40'} style={styles.avatar} alt="" />
                <div style={{ flex: 1 }}>
                  <p style={{ color: C.prata, fontWeight: '700' }}>{marca.nome}</p>
                  <p style={{ color: C.prataEscuro, fontSize: '12px' }}>{marca.usuario}</p>
                </div>
                <button onClick={() => seguirUsuario(marca.id)} style={{ ...styles.chip, ...(seguindo.includes(marca.id) ? styles.chipAtivo : {}) }}>
                  {seguindo.includes(marca.id) ? 'Seguindo' : 'Seguir'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'collabz' && podePostar() && (
          <div>
            <div style={styles.header}><h1 style={styles.logo}>Collabz 💬</h1></div>
            {collabMarcas.map(marca => (
              <div key={marca.id} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '12px', margin: '0 16px 8px' }}>
                <img src={marca.foto || 'https://picsum.photos/40'} style={styles.avatar} alt="" />
                <div style={{ flex: 1 }}>
                  <p style={{ color: C.prata, fontWeight: '700' }}>{marca.nome}</p>
                  <p style={{ color: C.prataEscuro, fontSize: '12px' }}>{marca.usuario}</p>
                </div>
                <button style={styles.chip}>💬 Chat</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'profile' && (
          <div>
            <div style={styles.header}>
              <h1 style={styles.logo}>Perfil</h1>
              <button onClick={handleLogout} style={{ ...styles.btnOutline, marginTop: '10px' }}>Sair</button>
            </div>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <img src={usuario?.foto || 'https://picsum.photos/200'} style={{ width: '100px', height: '100px', borderRadius: '50%', border: `2px solid ${C.prata}` }} alt="" />
              <h2 style={{ color: C.prata, marginTop: '10px' }}>{usuario?.nome}</h2>
              <p style={{ color: C.prataEscuro }}>{usuario?.usuario}</p>
              {podePostar() && (
                <div>
                  <p style={{ color: C.prata, fontWeight: '700', marginTop: '15px' }}>{meusPosts.length} Posts</p>
                  <div style={styles.grid}>
                    {meusPosts.map(post => (
                      <img key={post.id} src={post.imagens?.[0] || post.imagem || 'https://picsum.photos/200'} style={styles.gridImage} alt="" onClick={() => setPostAmpliado(post)} />
                    ))}
                  </div>
                  <button style={{ ...styles.btn, marginTop: '15px' }} onClick={() => setModalOpen('novoPost')}>+ Novo Post</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      {modalOpen === 'novoPost' && (
        <div style={styles.modal} onClick={() => setModalOpen(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: C.prata, marginBottom: '15px' }}>Novo Post</h3>
            <input style={styles.input} placeholder="URL da imagem" value={novoPostImg} onChange={e => setNovoPostImg(e.target.value)} />
            <input style={styles.input} placeholder="Legenda" value={novoPostDesc} onChange={e => setNovoPostDesc(e.target.value)} />
            <button style={styles.btn} onClick={publicarPost}>Publicar</button>
            <button style={{ ...styles.btnOutline, marginTop: '10px' }} onClick={() => setModalOpen(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {modalOpen === 'novoProduto' && (
        <div style={styles.modal} onClick={() => setModalOpen(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: C.prata, marginBottom: '15px' }}>Novo Produto</h3>
            <input style={styles.input} placeholder="Nome do produto" value={novoProdutoNome} onChange={e => setNovoProdutoNome(e.target.value)} />
            <input style={styles.input} placeholder="Preço (ex: 199,90)" value={novoProdutoPreco} onChange={e => setNovoProdutoPreco(e.target.value)} />
            <input style={styles.input} placeholder="URL da imagem" value={novoProdutoImg} onChange={e => setNovoProdutoImg(e.target.value)} />
            <button style={styles.btn} onClick={adicionarProduto}>Adicionar</button>
            <button style={{ ...styles.btnOutline, marginTop: '10px' }} onClick={() => setModalOpen(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {postAmpliado && (
        <div style={styles.modal} onClick={() => setPostAmpliado(null)}>
          <div style={{ ...styles.modalContent, background: 'transparent', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
            <img src={postAmpliado.imagens?.[0] || postAmpliado.imagem} style={{ width: '100%', borderRadius: '12px' }} alt="" />
            <p style={{ color: C.branco, textAlign: 'center', marginTop: '10px' }}>{postAmpliado.desc}</p>
            <p style={{ color: C.prataEscuro, textAlign: 'center', fontSize: '12px' }}>{postAmpliado.likes} curtidas</p>
          </div>
        </div>
      )}

      {/* Barra de navegação */}
      <div style={styles.tabBar}>
        {[
          { key: 'home', label: 'Home' },
          { key: 'searchz', label: 'Searchz' },
          { key: 'drops', label: 'Dropz' },
          ...(podePostar() ? [{ key: 'collabz', label: 'Collabz' }] : []),
          { key: 'profile', label: 'Perfil' },
        ].map(t => (
          <button key={t.key} style={styles.tab} onClick={() => setTab(t.key)}>
            <span style={{ fontSize: '18px' }}>{t.key === 'home' ? '🏠' : t.key === 'searchz' ? '🔍' : t.key === 'drops' ? '🔥' : t.key === 'collabz' ? '💬' : '👤'}</span>
            <span style={{ color: tab === t.key ? C.prata : C.prataEscuro, fontSize: '10px' }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}