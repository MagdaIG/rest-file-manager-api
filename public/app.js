// Estado de la aplicación
let authToken = localStorage.getItem('authToken');
let currentUser = null;
let selectedFiles = [];

// Elementos del DOM
const welcomePage = document.getElementById('welcome-page');
const startBtn = document.getElementById('start-btn');
const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const logoutBtn = document.getElementById('logout-btn');
const editProfileBtn = document.getElementById('edit-profile-btn');
const fileInput = document.getElementById('file-input');
const uploadArea = document.getElementById('upload-area');
const uploadBtn = document.getElementById('upload-btn');
const clearFilesBtn = document.getElementById('clear-files-btn');
const filesList = document.getElementById('files-list');
const refreshBtn = document.getElementById('refresh-btn');

// Elementos de modales
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalClose = document.getElementById('modal-close');
const modalConfirm = document.getElementById('modal-confirm');

const confirmModal = document.getElementById('confirm-modal');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const confirmClose = document.getElementById('confirm-close');
const confirmCancel = document.getElementById('confirm-cancel');
const confirmOk = document.getElementById('confirm-ok');

// Elementos del modal de perfil
const profileModal = document.getElementById('profile-modal');
const profileModalClose = document.getElementById('profile-modal-close');
const profileModalCancel = document.getElementById('profile-modal-cancel');
const profileModalSave = document.getElementById('profile-modal-save');
const updateProfileForm = document.getElementById('update-profile-form');

// Elementos de avatar
const userAvatar = document.getElementById('user-avatar');
const manageAvatarBtn = document.getElementById('manage-avatar-btn');
const avatarModal = document.getElementById('avatar-modal');
const avatarModalClose = document.getElementById('avatar-modal-close');
const avatarModalCloseBtn = document.getElementById('avatar-modal-close-btn');
const defaultAvatarsList = document.getElementById('default-avatars-list');
const avatarFileInput = document.getElementById('avatar-file-input');
const selectAvatarFileBtn = document.getElementById('select-avatar-file-btn');
const avatarPreviewContainer = document.getElementById('avatar-preview-container');
const avatarPreview = document.getElementById('avatar-preview');
const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
const deleteAvatarBtn = document.getElementById('delete-avatar-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initModals();
    initTabs();
    checkAuth();
    setupEventListeners();
});

// Inicializar modales
function initModals() {
    // Modal simple
    modalClose.addEventListener('click', () => closeModal());
    modalConfirm.addEventListener('click', () => closeModal());
    modal.querySelector('.modal-overlay').addEventListener('click', () => closeModal());
    
    // Modal de confirmación
    confirmClose.addEventListener('click', () => closeConfirmModal());
    confirmCancel.addEventListener('click', () => closeConfirmModal());
    confirmModal.querySelector('.modal-overlay').addEventListener('click', () => closeConfirmModal());
    
    // Modal de perfil
    profileModalClose.addEventListener('click', () => closeProfileModal());
    profileModalCancel.addEventListener('click', () => closeProfileModal());
    profileModal.querySelector('.modal-overlay').addEventListener('click', () => closeProfileModal());
    profileModalSave.addEventListener('click', handleUpdateProfile);
    
    // Modal de avatar
    if (avatarModalClose) {
        avatarModalClose.addEventListener('click', () => closeAvatarModal());
    }
    if (avatarModalCloseBtn) {
        avatarModalCloseBtn.addEventListener('click', () => closeAvatarModal());
    }
    if (avatarModal) {
        avatarModal.querySelector('.modal-overlay').addEventListener('click', () => closeAvatarModal());
    }
    
    // Navegación desde página de bienvenida
    startBtn.addEventListener('click', () => {
        showAuthPage();
    });
}

// Mostrar página de autenticación
function showAuthPage() {
    welcomePage.classList.add('hidden');
    authSection.classList.remove('hidden');
    mainSection.classList.add('hidden');
}

// Mostrar modal
function showModal(title, message, type = 'success') {
    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    modal.className = `modal ${type}`;
    modal.classList.remove('hidden');
}

// Cerrar modal
function closeModal() {
    modal.classList.add('hidden');
}

// Mostrar modal de confirmación
function showConfirmModal(title, message) {
    return new Promise((resolve) => {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmModal.classList.remove('hidden');
        
        const handleConfirm = () => {
            confirmOk.removeEventListener('click', handleConfirm);
            closeConfirmModal();
            resolve(true);
        };
        
        const handleCancel = () => {
            confirmCancel.removeEventListener('click', handleCancel);
            closeConfirmModal();
            resolve(false);
        };
        
        confirmOk.addEventListener('click', handleConfirm);
        confirmCancel.addEventListener('click', handleCancel);
    });
}

// Cerrar modal de confirmación
function closeConfirmModal() {
    confirmModal.classList.add('hidden');
}

// Mostrar modal de perfil
function showProfileModal() {
    // Cargar datos actuales del usuario
    document.getElementById('update-username').value = currentUser.username || '';
    document.getElementById('update-email').value = currentUser.email || '';
    document.getElementById('update-password').value = '';
    profileModal.classList.remove('hidden');
}

// Cerrar modal de perfil
function closeProfileModal() {
    profileModal.classList.add('hidden');
    updateProfileForm.reset();
}

// Manejar actualización de perfil
async function handleUpdateProfile() {
    const username = document.getElementById('update-username').value.trim();
    const email = document.getElementById('update-email').value.trim();
    const password = document.getElementById('update-password').value.trim();
    
    // Construir objeto con solo los campos que tienen valor
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) updates.password = password;
    
    // Validar que al menos un campo tenga valor
    if (Object.keys(updates).length === 0) {
        showModal('Advertencia', 'Debes completar al menos un campo para actualizar tu perfil', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(updates)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Actualizar datos del usuario actual
            currentUser = { ...currentUser, ...data.user };
            showModal('Éxito', 'Perfil actualizado exitosamente', 'success');
            closeProfileModal();
            
            // Actualizar la visualización del usuario
            document.getElementById('username-display').textContent = currentUser.username;
            document.getElementById('user-email').textContent = currentUser.email;
            updateUserAvatar();
        } else {
            showModal('Error', data.message || 'Error al actualizar perfil', 'error');
        }
    } catch (error) {
        showModal('Error', 'Error de conexión', 'error');
        console.error('Error:', error);
    }
}

// Configurar pestañas de autenticación
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const switchTab = (tab) => {
        // Actualizar botones
        tabButtons.forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Actualizar formularios
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        if (tab === 'login') {
            document.getElementById('login-form').classList.add('active');
        } else {
            document.getElementById('register-form').classList.add('active');
        }
    };
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Enlaces para cambiar entre login y registro
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('register');
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('login');
        });
    }
}

// Verificar autenticación
function checkAuth() {
    if (authToken) {
        verifyToken();
    } else {
        showWelcomePage();
    }
}

// Mostrar página de bienvenida
function showWelcomePage() {
    welcomePage.classList.remove('hidden');
    authSection.classList.add('hidden');
    mainSection.classList.add('hidden');
}

// Verificar token
async function verifyToken() {
    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showMainSection();
            loadFiles();
        } else {
            localStorage.removeItem('authToken');
            authToken = null;
            showAuthSection();
        }
    } catch (error) {
        console.error('Error verificando token:', error);
        showAuthSection();
    }
}

// Mostrar sección de autenticación
function showAuthSection() {
    welcomePage.classList.add('hidden');
    authSection.classList.remove('hidden');
    mainSection.classList.add('hidden');
}

// Mostrar sección principal
function showMainSection() {
    authSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    document.getElementById('username-display').textContent = currentUser.username;
    document.getElementById('user-email').textContent = currentUser.email;
    updateUserAvatar();
}

// Actualizar avatar del usuario
function updateUserAvatar() {
    if (currentUser && currentUser.avatar) {
        userAvatar.src = currentUser.avatar;
        userAvatar.style.display = 'block';
    } else {
        userAvatar.src = '';
        userAvatar.style.display = 'none';
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Login
    loginForm.addEventListener('submit', handleLogin);
    
    // Registro
    registerForm.addEventListener('submit', handleRegister);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Editar perfil
    editProfileBtn.addEventListener('click', showProfileModal);
    
    // Gestionar avatar
    if (manageAvatarBtn) {
        manageAvatarBtn.addEventListener('click', showAvatarModal);
    }
    
    // Avatar file input
    if (selectAvatarFileBtn) {
        selectAvatarFileBtn.addEventListener('click', () => avatarFileInput.click());
    }
    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', handleAvatarFileSelect);
    }
    if (uploadAvatarBtn) {
        uploadAvatarBtn.addEventListener('click', handleUploadAvatar);
    }
    if (deleteAvatarBtn) {
        deleteAvatarBtn.addEventListener('click', handleDeleteAvatar);
    }
    
    // Eliminar cuenta
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }
    
    // Subida de archivos
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    uploadBtn.addEventListener('click', handleUpload);
    
    // Limpiar selección
    if (clearFilesBtn) {
        clearFilesBtn.addEventListener('click', () => {
            selectedFiles = [];
            fileInput.value = '';
            updateUploadUI();
        });
    }
    
    // Actualizar lista
    refreshBtn.addEventListener('click', () => {
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Actualizando...';
        loadFiles(true, true).finally(() => {
            refreshBtn.disabled = false;
            refreshBtn.textContent = 'Actualizar';
        });
    });
}

// Manejar login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            showModal('Éxito', 'Login exitoso. Bienvenido de nuevo.', 'success');
            showMainSection();
            loadFiles(true, false);
            loginForm.reset();
        } else {
            showModal('Error', data.message || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        showModal('Error', 'Error de conexión', 'error');
        console.error('Error:', error);
    }
}

// Manejar registro
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            showModal('Éxito', 'Registro exitoso. Tu cuenta ha sido creada correctamente.', 'success');
            showMainSection();
            loadFiles(true, false);
            registerForm.reset();
        } else {
            showModal('Error', data.message || 'Error al registrarse', 'error');
        }
    } catch (error) {
        showModal('Error', 'Error de conexión', 'error');
        console.error('Error:', error);
    }
}

// Manejar logout
function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showWelcomePage();
    showModal('Sesión cerrada', 'Has cerrado sesión correctamente.', 'success');
}

// Manejar drag over
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

// Manejar drag leave
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Manejar drop
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    selectedFiles = files;
    updateUploadUI();
}

// Manejar selección de archivos
function handleFileSelect(e) {
    selectedFiles = Array.from(e.target.files);
    updateUploadUI();
}

// Actualizar UI de subida
function updateUploadUI() {
    const placeholder = uploadArea.querySelector('.upload-placeholder');
    
    if (selectedFiles.length > 0) {
        placeholder.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p class="upload-main-text"><strong>${selectedFiles.length} archivo(s) seleccionado(s)</strong></p>
            <div class="selected-files">
                ${selectedFiles.map(file => `
                    <div class="file-item">
                        <span class="file-item-name">${file.name}</span>
                        <span class="file-item-size">${formatFileSize(file.size)}</span>
                    </div>
                `).join('')}
            </div>
            <p class="upload-hint">Tamaño máximo por archivo: 10MB | Formatos permitidos: Todos</p>
        `;
        uploadBtn.disabled = false;
        if (clearFilesBtn) {
            clearFilesBtn.classList.remove('hidden');
        }
    } else {
        placeholder.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p class="upload-main-text">Haz clic aquí para seleccionar archivos</p>
            <p class="upload-sub-text">o arrastra y suelta tus archivos en esta área</p>
            <p class="upload-hint">Tamaño máximo por archivo: 10MB | Formatos permitidos: Todos</p>
        `;
        uploadBtn.disabled = true;
        if (clearFilesBtn) {
            clearFilesBtn.classList.add('hidden');
        }
    }
}

// Manejar subida de archivos
async function handleUpload() {
    if (selectedFiles.length === 0) return;
    
    uploadBtn.disabled = true;
    const btnText = uploadBtn.querySelector('.btn-text');
    const btnLoading = uploadBtn.querySelector('.btn-loading');
    if (btnText) btnText.classList.add('hidden');
    if (btnLoading) btnLoading.classList.remove('hidden');
    
    let successCount = 0;
    let errorCount = 0;
    
    try {
        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                successCount++;
            } else {
                errorCount++;
                showModal('Error', `Error al subir ${file.name}: ${data.message}`, 'error');
            }
        }
        
        if (successCount > 0) {
            showModal('Éxito', `${successCount} archivo(s) subido(s) exitosamente`, 'success');
        }
        
        selectedFiles = [];
        fileInput.value = '';
        updateUploadUI();
        loadFiles(true, false);
    } catch (error) {
        showModal('Error', 'Error de conexión al subir archivos', 'error');
        console.error('Error:', error);
    } finally {
        uploadBtn.disabled = false;
        if (btnText) btnText.classList.remove('hidden');
        if (btnLoading) btnLoading.classList.add('hidden');
    }
}

// Cargar lista de archivos
async function loadFiles(showLoading = true, showSuccessMessage = false) {
    try {
        if (showLoading) {
            filesList.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p class="empty-message">Cargando tus archivos...</p>
                </div>
            `;
        }
        
        const response = await fetch('/api/files', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (data.files.length === 0) {
                filesList.innerHTML = `
                    <div class="empty-state">
                        <p class="empty-message">No tienes archivos subidos aún</p>
                        <p class="empty-hint">Comienza subiendo tu primer archivo usando el área de arriba</p>
                    </div>
                `;
            } else {
                filesList.innerHTML = data.files.map(file => `
                    <div class="file-card">
                        <div class="file-info">
                            <div class="file-name">${file.originalName}</div>
                            <div class="file-meta">
                                <span>Tamaño: ${formatFileSize(file.size)}</span>
                                <span>Tipo: ${file.mimetype}</span>
                                <span>Subido: ${formatDate(file.uploadedAt)}</span>
                            </div>
                        </div>
                        <div class="file-actions">
                            <button class="btn" onclick="viewFileDetails(${file.id})">Ver Detalles</button>
                            <button class="btn btn-danger" onclick="deleteFile(${file.id})">Eliminar</button>
                        </div>
                    </div>
                `).join('');
            }
            
            if (showSuccessMessage) {
                const fileCount = data.files.length;
                let message = '';
                if (fileCount === 0) {
                    message = 'Se consultó el servidor y no hay archivos en tu cuenta. Si acabas de subir un archivo, debería aparecer aquí.';
                } else {
                    message = `Se consultó el servidor y se encontraron ${fileCount} archivo(s) en tu cuenta. La lista se ha actualizado con la información más reciente del servidor.`;
                }
                showModal('Sincronización Completada', message, 'success');
            }
        } else {
            filesList.innerHTML = '<p class="empty-message">Error al cargar archivos</p>';
            showModal('Error', data.message || 'Error al cargar archivos', 'error');
        }
    } catch (error) {
        filesList.innerHTML = '<p class="empty-message">Error de conexión</p>';
        showModal('Error', 'Error de conexión', 'error');
        console.error('Error:', error);
    }
}

// Ver detalles de archivo
async function viewFileDetails(fileId) {
    try {
        const response = await fetch(`/api/files/${fileId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const file = data.file;
            const details = `
                <div class="file-details-container">
                    <div class="file-detail-item">
                        <span class="file-detail-label">Nombre Original:</span>
                        <span class="file-detail-value">${file.originalName}</span>
                    </div>
                    <div class="file-detail-item">
                        <span class="file-detail-label">Nombre en Servidor:</span>
                        <span class="file-detail-value">${file.fileName}</span>
                    </div>
                    <div class="file-detail-item">
                        <span class="file-detail-label">Tamaño:</span>
                        <span class="file-detail-value">${formatFileSize(file.size)}</span>
                    </div>
                    <div class="file-detail-item">
                        <span class="file-detail-label">Tipo MIME:</span>
                        <span class="file-detail-value">${file.mimetype}</span>
                    </div>
                    <div class="file-detail-item">
                        <span class="file-detail-label">ID:</span>
                        <span class="file-detail-value">${file.id}</span>
                    </div>
                    <div class="file-detail-item">
                        <span class="file-detail-label">Subido:</span>
                        <span class="file-detail-value">${formatDate(file.uploadedAt)}</span>
                    </div>
                </div>
            `;
            showModal('Detalles del Archivo', details, 'success');
        } else {
            showModal('Error', data.message || 'Error al obtener detalles del archivo', 'error');
        }
    } catch (error) {
        showModal('Error', 'Error de conexión', 'error');
        console.error('Error:', error);
    }
}

// Eliminar archivo
async function deleteFile(fileId) {
    const confirmed = await showConfirmModal(
        'Confirmar eliminación',
        '¿Estás seguro de que deseas eliminar este archivo? Esta acción no se puede deshacer.'
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showModal('Éxito', 'Archivo eliminado exitosamente', 'success');
            loadFiles(true, false);
        } else {
            showModal('Error', data.message || 'Error al eliminar archivo', 'error');
        }
    } catch (error) {
        showModal('Error', 'Error de conexión', 'error');
        console.error('Error:', error);
    }
}


// Mostrar modal de avatar
async function showAvatarModal() {
    avatarModal.classList.remove('hidden');
    await loadDefaultAvatars();
}

// Cerrar modal de avatar
function closeAvatarModal() {
    avatarModal.classList.add('hidden');
    avatarPreviewContainer.classList.add('hidden');
    avatarFileInput.value = '';
}

// Cargar avatares predeterminados
async function loadDefaultAvatars() {
    try {
        defaultAvatarsList.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Cargando avatares...</p>
            </div>
        `;
        
        const response = await fetch('/api/users/avatars/defaults', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.avatars) {
            defaultAvatarsList.innerHTML = data.avatars.map(avatar => {
                // Verificar si este avatar está seleccionado comparando la URL
                const isSelected = currentUser && currentUser.avatar && currentUser.avatar === avatar.url;
                return `
                    <div class="avatar-item ${isSelected ? 'selected' : ''}" data-avatar-id="${avatar.id}">
                        <img src="${avatar.url}" alt="${avatar.name}">
                    </div>
                `;
            }).join('');
            
            // Agregar event listeners a los avatares
            defaultAvatarsList.querySelectorAll('.avatar-item').forEach(item => {
                item.addEventListener('click', () => {
                    const avatarId = item.dataset.avatarId;
                    selectDefaultAvatar(avatarId);
                });
            });
        } else {
            defaultAvatarsList.innerHTML = '<p class="empty-message">Error al cargar avatares</p>';
        }
    } catch (error) {
        defaultAvatarsList.innerHTML = '<p class="empty-message">Error de conexión</p>';
        console.error('Error:', error);
    }
}

// Seleccionar avatar predeterminado
async function selectDefaultAvatar(avatarId) {
    try {
        const response = await fetch('/api/users/avatar/select', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ avatarId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser.avatar = data.avatar;
            updateUserAvatar();
            showModal('Éxito', 'Avatar seleccionado exitosamente', 'success');
            closeAvatarModal();
            await loadDefaultAvatars(); // Recargar para actualizar selección
        } else {
            showModal('Error', data.message || 'Error al seleccionar avatar', 'error');
        }
    } catch (error) {
        showModal('Error', 'Error de conexión', 'error');
        console.error('Error:', error);
    }
}

// Manejar selección de archivo de avatar
function handleAvatarFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showModal('Error', 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)', 'error');
        return;
    }
    
    // Validar tamaño (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        showModal('Error', 'El archivo es demasiado grande. Tamaño máximo: 2MB', 'error');
        return;
    }
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
        avatarPreview.src = e.target.result;
        avatarPreviewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// Subir avatar personalizado
async function handleUploadAvatar() {
    const file = avatarFileInput.files[0];
    if (!file) {
        showModal('Error', 'Por favor selecciona una imagen', 'error');
        return;
    }
    
    try {
        uploadAvatarBtn.disabled = true;
        uploadAvatarBtn.textContent = 'Subiendo...';
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await fetch('/api/users/avatar/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser.avatar = data.avatar;
            updateUserAvatar();
            showModal('Éxito', 'Avatar subido exitosamente', 'success');
            closeAvatarModal();
        } else {
            showModal('Error', data.message || 'Error al subir avatar', 'error');
        }
    } catch (error) {
        showModal('Error', 'Error de conexión', 'error');
        console.error('Error:', error);
    } finally {
        uploadAvatarBtn.disabled = false;
        uploadAvatarBtn.textContent = 'Subir Avatar';
    }
}

// Eliminar avatar
async function handleDeleteAvatar() {
    const confirmed = await showConfirmModal(
        'Confirmar eliminación',
        '¿Estás seguro de que deseas eliminar tu avatar? Esta acción no se puede deshacer.'
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await fetch('/api/users/avatar', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser.avatar = null;
            updateUserAvatar();
            showModal('Éxito', 'Avatar eliminado exitosamente', 'success');
            closeAvatarModal();
            await loadDefaultAvatars(); // Recargar para actualizar selección
        } else {
            showModal('Error', data.message || 'Error al eliminar avatar', 'error');
        }
    } catch (error) {
        showModal('Error', 'Error de conexión', 'error');
        console.error('Error:', error);
    }
}

// Eliminar cuenta
async function handleDeleteAccount() {
    const confirmed = await showConfirmModal(
        'Confirmar eliminación de cuenta',
        '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos, archivos y avatares.'
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await fetch('/api/users/profile', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showModal('Cuenta eliminada', 'Tu cuenta ha sido eliminada exitosamente', 'success');
            handleLogout();
        } else {
            showModal('Error', data.message || 'Error al eliminar cuenta', 'error');
        }
    } catch (error) {
        showModal('Error', 'Error de conexión', 'error');
        console.error('Error:', error);
    }
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

