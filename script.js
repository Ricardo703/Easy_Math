// Estado
let files = [], showTheory = false, showActivities = false;
let activeCategory = 'probability';
let selectedAnswers = {}, answeredWrong = {}, showAnswer = {};

// --- Funções de Interação com Conteúdo Estático ---

function toggleTheory() {
    showTheory = !showTheory;
    showActivities = false;
    document.getElementById('theory-section').classList.toggle('hidden', !showTheory);
    document.getElementById('activities-section').classList.add('hidden');
    document.getElementById('theory-btn-text').textContent = showTheory ? 'Ocultar Teoria' : 'Ver Teoria';
    document.getElementById('activities-btn-text').textContent = 'Praticar Exercícios';
    
    // Garante que a categoria ativa seja exibida
    updateCategoryDisplay();
}

function toggleActivities() {
    showActivities = !showActivities;
    showTheory = false;
    document.getElementById('activities-section').classList.toggle('hidden', !showActivities);
    document.getElementById('theory-section').classList.add('hidden');
    document.getElementById('activities-btn-text').textContent = showActivities ? 'Ocultar Exercícios' : 'Praticar Exercícios';
    document.getElementById('theory-btn-text').textContent = 'Ver Teoria';
    
    // Garante que a categoria ativa seja exibida
    updateCategoryDisplay();
}

function setActiveCategory(cat) { 
    activeCategory = cat; 
    
    // Esconde todos os conteúdos de teoria e atividades
    document.querySelectorAll('#theory-section [data-category-content], #activities-section [data-category-content]').forEach(el => {
        el.classList.add('hidden');
    });

    // Mostra o conteúdo da categoria selecionada
    document.querySelectorAll(`[data-category-content="${cat}"]`).forEach(el => {
        el.classList.remove('hidden');
    });

    // Atualiza o estado ativo dos botões
    document.querySelectorAll('.category-selector .category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll(`.category-selector .category-btn[data-category="${cat}"]`).forEach(btn => {
        btn.classList.add('active');
    });
    
    // Reinicia o estado de respostas para a nova categoria
    selectedAnswers = {};
    answeredWrong = {};
    showAnswer = {};
    
    // Re-renderiza o estado das atividades para a nova categoria
    if (showActivities) {
        updateActivityState();
    }
}

function updateCategoryDisplay() {
    // Esconde todos os conteúdos de teoria e atividades
    document.querySelectorAll('#theory-section [data-category-content], #activities-section [data-category-content]').forEach(el => {
        el.classList.add('hidden');
    });

    // Mostra o conteúdo da categoria ativa
    if (showTheory || showActivities) {
        document.querySelectorAll(`[data-category-content="${activeCategory}"]`).forEach(el => {
            el.classList.remove('hidden');
        });
    }
}

function checkAnswer(activityId, selectedOptionId) {
    const activityCard = document.querySelector(`.activity-card[data-activity-id="${activityId}"]`);
    if (!activityCard) return;

    const correctOptionId = activityCard.getAttribute('data-correct-option');
    const isCorrect = selectedOptionId === correctOptionId;

    selectedAnswers[activityId] = selectedOptionId;
    answeredWrong[activityId] = !isCorrect;

    updateActivityState(activityId);
}

function revealAnswer(activityId) { 
    showAnswer[activityId] = true; 
    updateActivityState(activityId); 
}

function updateActivityState(activityId = null) {
    const activitiesToUpdate = activityId 
        ? [document.querySelector(`.activity-card[data-activity-id="${activityId}"]`)]
        : document.querySelectorAll('#activities-section .activity-card');

    activitiesToUpdate.forEach(card => {
        if (!card) return;
        const id = card.getAttribute('data-activity-id');
        const correctOptionId = card.getAttribute('data-correct-option');
        const selectedOptionId = selectedAnswers[id];
        const isAnswered = selectedOptionId !== undefined;
        const isWrong = answeredWrong[id];
        const isAnswerRevealed = showAnswer[id];

        const optionsContainer = card.querySelector('[data-options-container]');
        const resultContainer = card.querySelector('[data-result-container]');
        const revealBtn = card.querySelector('.reveal-btn');
        const explanationBox = card.querySelector('.explanation-box');

        // 1. Lógica dos Botões de Opção
        if (optionsContainer) {
            optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                const optionId = btn.getAttribute('data-option-id');
                btn.disabled = isAnswered;
                btn.classList.remove('correct', 'wrong');

                if (isAnswered) {
                    if (optionId === correctOptionId) {
                        btn.classList.add('correct');
                    } else if (optionId === selectedOptionId) {
                        btn.classList.add('wrong');
                    }
                }
            });
        }

        // 2. Lógica do Resultado
        if (resultContainer) {
            resultContainer.innerHTML = '';
            if (isAnswered && !isWrong) {
                resultContainer.innerHTML = '<div class="result-box result-success"><p>🎉 Resposta Correta! Parabéns.</p></div>';
            } else if (isAnswered && isWrong) {
                resultContainer.innerHTML = '<div class="result-box result-error"><p>Resposta Incorreta. Tente novamente ou revele a resposta.</p></div>';
            }
        }

        // 3. Lógica do Botão Revelar e Explicação
        if (revealBtn) {
            if (isAnswered && isWrong && !isAnswerRevealed) {
                revealBtn.classList.remove('hidden');
            } else {
                revealBtn.classList.add('hidden');
            }
        }

        if (explanationBox) {
            if (isAnswerRevealed) {
                explanationBox.classList.remove('hidden');
            } else {
                explanationBox.classList.add('hidden');
            }
        }
    });
}

// --- Funções de Upload e Arquivos ---

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function handleFiles(fileList) {
    let fileIdCounter = files.length > 0 ? Math.max(...files.map(f => f.id)) + 1 : 0;
    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        files.push({
            id: fileIdCounter++,
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type || 'application/octet-stream',
            file: file
        });
    }
    renderFiles();
}

function openFile(id) { 
    const fileItem = files.find(f => f.id === id);
    if (fileItem) {
        alert(`Abrindo arquivo: ${fileItem.name} (${fileItem.size}). Na aplicação real, isso abriria ou faria o download.`);
    }
}

function removeFile(id) { 
    files = files.filter(f => f.id !== id); 
    renderFiles(); 
}

function renderFiles() { 
    const filesContainer = document.getElementById('files-container');
    const filesList = document.getElementById('files-list');
    const filesCount = document.getElementById('files-count');
    const emptyState = document.getElementById('empty-state');

    if (filesCount) filesCount.textContent = files.length;
    if (filesList) filesList.innerHTML = ''; // Limpa antes de renderizar

    if (files.length === 0) {
        if (filesContainer) filesContainer.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (filesContainer) filesContainer.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    
    const template = document.getElementById('file-item-template');
    if (!template) return;

    files.forEach(file => {
        const fileItem = template.content.cloneNode(true);
        
        fileItem.querySelector('[data-file-name]').textContent = file.name;
        fileItem.querySelector('[data-file-meta]').textContent = `${file.size} | ${file.type.split('/')[1] ? file.type.split('/')[1].toUpperCase() : 'N/A'}`;
        
        // Define as funções onclick nos botões
        fileItem.querySelector('[data-open-btn]').addEventListener('click', () => openFile(file.id));
        fileItem.querySelector('[data-remove-btn]').addEventListener('click', () => removeFile(file.id));

        filesList.appendChild(fileItem);
    });
}


// --- Funções de Inicialização ---

function initializeListeners() {
    // Botões de Teoria e Atividades
    const btnTheory = document.getElementById('btn-theory');
    const btnActivities = document.getElementById('btn-activities');
    
    if (btnTheory) btnTheory.addEventListener('click', toggleTheory);
    if (btnActivities) btnActivities.addEventListener('click', toggleActivities);

    // Botões de Categoria (Teoria e Atividades)
    document.querySelectorAll('.category-selector .category-btn').forEach(btn => {
        btn.addEventListener('click', () => setActiveCategory(btn.getAttribute('data-category')));
    });

    // Adiciona listeners para os botões de opção e revelar explicação
    document.querySelectorAll('.activity-card').forEach(card => {
        const activityId = card.getAttribute('data-activity-id');
        
        // Botões de Opção
        card.querySelectorAll('.option-btn').forEach(btn => {
            const optionId = btn.getAttribute('data-option-id');
            btn.addEventListener('click', () => checkAnswer(activityId, optionId));
        });
        
        // Botões de Revelar Explicação
        const revealBtn = card.querySelector('.reveal-btn');
        if (revealBtn) {
            revealBtn.addEventListener('click', () => revealAnswer(activityId));
        }
    });

    // --- Listeners de Upload ---
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });

        // Drag and Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#bd6615';
            uploadArea.style.background = 'rgba(0, 0, 0, 0.4)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#b99269';
            uploadArea.style.background = 'rgba(0, 0, 0, 0.2)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#b99269';
            uploadArea.style.background = 'rgba(0, 0, 0, 0.2)';
            handleFiles(e.dataTransfer.files);
        });
    }

    // Inicializa o estado de exibição
    updateCategoryDisplay();
    updateActivityState();
}

function init() {
    initializeListeners();
    renderFiles();
}

// Inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
