// js/firebase-config.js
// Configuração do Firebase - EliteControl Sistema - CORRIGIDO

// IMPORTANTE: Substitua estas configurações pelas do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD1t6vbSqI2s1Wsw3eGSMozWaZSTMDfukA",
  authDomain: "elitecontrol-765fd.firebaseapp.com",
  projectId: "elitecontrol-765fd",
  storageBucket: "elitecontrol-765fd.appspot.com",
  messagingSenderId: "939140418428",
  appId: "1:939140418428:web:beeca76505e69329baf2f9",
  measurementId: "G-PNDBZB9HR5"
};

// Verificar se o Firebase SDK foi carregado
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase SDK não foi carregado! Verifique se os scripts estão incluídos.');
  throw new Error('Firebase SDK não encontrado');
}

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar serviços
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Configurações de desenvolvimento vs produção
const isDevelopment = location.hostname === 'localhost' ||
                     location.hostname === '127.0.0.1' ||
                     location.hostname.includes('localhost:');

if (isDevelopment) {
  console.log('🔧 Modo de desenvolvimento ativo');
  firebase.firestore.setLogLevel('debug');
} else {
  console.log('🚀 Modo de produção ativo');
  firebase.firestore.setLogLevel('silent');
}

// Configurações do Firestore
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Habilitar persistência offline
db.enablePersistence()
  .then(() => {
    console.log('✅ Persistência offline habilitada');
  })
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('⚠️ Múltiplas abas abertas, persistência offline pode ser afetada');
    } else if (err.code == 'unimplemented') {
      console.warn('⚠️ O navegador não suporta persistência offline');
    }
  });

console.log('✅ Serviços Firebase configurados:');
console.log('   - Authentication: ✅');
console.log('   - Firestore: ✅');
console.log('   - Analytics: ✅');

// Função utilitária para verificar conexão
window.checkFirebaseConnection = async function() {
  try {
    // Tentar uma operação simples para verificar conectividade
    await db.collection('_test').limit(1).get();
    console.log('✅ Conexão com Firestore verificada');
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão com Firestore:', error);
    return false;
  }
};

// Função utilitária para verificar autenticação
window.checkAuthStatus = function() {
  return new Promise((resolve) => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
};

// Event listeners para monitorar estado da conexão
window.addEventListener('online', () => {
  console.log('🌐 Conexão online restaurada');
});

window.addEventListener('offline', () => {
  console.warn('📡 Conexão offline - dados serão sincronizados quando voltar online');
});

// Exportar instâncias
export { auth, db, analytics };

// Log final de confirmação
console.log('🎉 Firebase EliteControl configurado e pronto para uso!');
console.log('📊 Projeto:', firebaseConfig.projectId);
console.log('🔐 Domínio:', firebaseConfig.authDomain);
