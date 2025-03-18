const initialStep = document.getElementById('initialStep');
        const authStep = document.getElementById('authStep');
        const photoStep = document.getElementById('photoStep');
        const locationStep = document.getElementById('locationStep');
        const successStep = document.getElementById('successStep');
        
        const step1Indicator = document.getElementById('step1');
        const step2Indicator = document.getElementById('step2');
        const step3Indicator = document.getElementById('step3');
        
        const confirmBtn = document.getElementById('confirmBtn');
        const emailInput = document.getElementById('emailInput');
        const emailError = document.getElementById('emailError');
        const authBtn = document.getElementById('authBtn');
        const videoElement = document.getElementById('videoElement');
        const canvas = document.getElementById('canvas');
        const capturedPhoto = document.getElementById('capturedPhoto');
        const captureBtn = document.getElementById('captureBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const confirmPhotoBtn = document.getElementById('confirmPhotoBtn');
        const captureControls = document.getElementById('captureControls');
        const photoControls = document.getElementById('photoControls');
        const getLocationBtn = document.getElementById('getLocationBtn');
        const locationInfo = document.getElementById('locationInfo');
        const resetBtn = document.getElementById('resetBtn');
        const registrationDetails = document.getElementById('registrationDetails');
        
        let stream = null;
        let userEmail = '';
        let captureTime = '';
        let userLocation = '';
        
        // E-mails válidos da UCB
        function isValidUcbEmail(email) {
            // Verifica se termina com @a.ucb.br
            return email.toLowerCase().endsWith('@a.ucb.br');
        }
        

        // Função para alternar entre as etapas
        function showStep(step) {
            // Ocultar todas as etapas
            initialStep.classList.add('hidden');
            authStep.classList.add('hidden');
            photoStep.classList.add('hidden');
            locationStep.classList.add('hidden');
            successStep.classList.add('hidden');
            
            // Mostrar a etapa atual
            step.classList.remove('hidden');
            
            // Atualizar indicadores de etapa
            step1Indicator.className = 'step';
            step2Indicator.className = 'step';
            step3Indicator.className = 'step';
            
            if (step === authStep) {
                step1Indicator.className = 'step active';
            } else if (step === photoStep) {
                step1Indicator.className = 'step completed';
                step2Indicator.className = 'step active';
            } else if (step === locationStep) {
                step1Indicator.className = 'step completed';
                step2Indicator.className = 'step completed';
                step3Indicator.className = 'step active';
            } else if (step === successStep) {
                step1Indicator.className = 'step completed';
                step2Indicator.className = 'step completed';
                step3Indicator.className = 'step completed';
            }
        }
        
        // Etapa 1: Botão inicial
        confirmBtn.addEventListener('click', () => {
            showStep(authStep);
        });
        
// Etapa 2: Autenticação com e-mail
authBtn.addEventListener('click', () => {
    const email = emailInput.value.trim();
    
    // Verifica se é um e-mail válido com o domínio @a.ucb.br
    if (isValidUcbEmail(email)) {
        emailError.classList.remove('show');
        userEmail = email;
        showStep(photoStep);
        initCamera();
    } else {
        emailError.classList.add('show');
        emailError.textContent = "Por favor, utilize um e-mail institucional válido (@a.ucb.br)";
    }
});
        
        // Etapa 3: Captura de foto
        function initCamera() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(function(mediaStream) {
                        stream = mediaStream;
                        videoElement.srcObject = mediaStream;
                    })
                    .catch(function(error) {
                        console.error('Não foi possível acessar a câmera:', error);
                        alert('Erro ao acessar a câmera. Por favor, permita o acesso à câmera e tente novamente.');
                    });
            } else {
                alert('Seu navegador não suporta acesso à câmera.');
            }
        }
        
        captureBtn.addEventListener('click', () => {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            canvas.getContext('2d').drawImage(videoElement, 0, 0);
            
            capturedPhoto.src = canvas.toDataURL('image/png');
            videoElement.classList.add('hidden');
            capturedPhoto.classList.remove('hidden');
            captureControls.classList.add('hidden');
            photoControls.classList.remove('hidden');
            
            // Registra o horário da captura
            const now = new Date();
            captureTime = now.toLocaleString('pt-BR');
        });
        
        retakeBtn.addEventListener('click', () => {
            videoElement.classList.remove('hidden');
            capturedPhoto.classList.add('hidden');
            captureControls.classList.remove('hidden');
            photoControls.classList.add('hidden');
        });
        
        confirmPhotoBtn.addEventListener('click', () => {
            stopCamera();
            showStep(locationStep);
        });
        
        function stopCamera() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
        
        // Etapa 4: Localização
        getLocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                locationInfo.textContent = "Obtendo sua localização atual...";
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        
                        // Armazenar coordenadas como backup
                        const coordsStr = `Lat ${latitude.toFixed(6)}, Long ${longitude.toFixed(6)}`;
                        
                        // Obter nome do local usando a API Nominatim do OpenStreetMap
                        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
                            .then(response => response.json())
                            .then(data => {
                                // Extrair informações relevantes do endereço
                                let placeName = "Local não identificado";
                                
                                if (data && data.display_name) {
                                    // Tentar extrair informações mais relevantes
                                    const address = data.address;
                                    
                                    if (address) {
                                        // Montar endereço em formato mais amigável
                                        const parts = [];
                                        
                                        // Adicionar componentes do endereço na ordem de relevância
                                        if (address.road) parts.push(address.road);
                                        if (address.suburb) parts.push(address.suburb);
                                        if (address.city || address.town) parts.push(address.city || address.town);
                                        if (address.state) parts.push(address.state);
                                        
                                        if (parts.length > 0) {
                                            placeName = parts.join(', ');
                                        } else {
                                            // Se não conseguimos extrair componentes específicos, usar o display_name completo
                                            placeName = data.display_name;
                                        }
                                    } else {
                                        placeName = data.display_name;
                                    }
                                }
                                
                                userLocation = placeName;
                                locationInfo.textContent = `✓ Localização obtida com sucesso: ${userLocation}`;
                                locationInfo.style.backgroundColor = "#d4edda";
                                locationInfo.style.color = "#155724";
                                
                                // Formatar nome do aluno a partir do e-mail
                                const emailName = userEmail.split('@')[0];
                                const formattedName = emailName
                                    .split('.')
                                    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                                    .join(' ');
                                
                                // Prepara os detalhes do registro
                                registrationDetails.innerHTML = `
                                    <p>Aluno: <span>${formattedName}</span></p>
                                    <p>E-mail: <span>${userEmail}</span></p>
                                    <p>Data/Hora: <span>${captureTime}</span></p>
                                    <p>Localização: <span>${userLocation}</span></p>
                                `;
                                
                                // Esperar um pouco antes de mostrar a tela de sucesso
                                setTimeout(() => {
                                    showStep(successStep);
                                }, 1500);
                            })
                            .catch(error => {
                                console.error('Erro ao obter nome do local:', error);
                                // Em caso de erro na geocodificação, usar as coordenadas como fallback
                                userLocation = coordsStr;
                                locationInfo.textContent = `✓ Localização obtida com sucesso: ${userLocation}`;
                                locationInfo.style.backgroundColor = "#d4edda";
                                locationInfo.style.color = "#155724";
                                
                                // Continuar com o processo usando as coordenadas
                                const emailName = userEmail.split('@')[0];
                                const formattedName = emailName
                                    .split('.')
                                    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                                    .join(' ');
                                
                                registrationDetails.innerHTML = `
                                    <p>Aluno: <span>${formattedName}</span></p>
                                    <p>E-mail: <span>${userEmail}</span></p>
                                    <p>Data/Hora: <span>${captureTime}</span></p>
                                    <p>Localização: <span>${userLocation}</span></p>
                                `;
                                
                                setTimeout(() => {
                                    showStep(successStep);
                                }, 1500);
                            });
                    },
                    (error) => {
                        console.error('Erro ao obter localização:', error);
                        locationInfo.textContent = "❌ Erro ao obter localização. Por favor, tente novamente.";
                        locationInfo.style.backgroundColor = "#f8d7da";
                        locationInfo.style.color = "#721c24";
                    },
                    { 
                        enableHighAccuracy: true, 
                        timeout: 10000, 
                        maximumAge: 0 
                    }
                );
            } else {
                locationInfo.textContent = "❌ Seu navegador não suporta geolocalização.";
                locationInfo.style.backgroundColor = "#f8d7da";
                locationInfo.style.color = "#721c24";
            }
        });
        
        // Etapa 5: Reiniciar
        resetBtn.addEventListener('click', () => {
            emailInput.value = '';
            capturedPhoto.src = '';
            locationInfo.textContent = "Aguardando permissão para acessar a localização...";
            locationInfo.style.backgroundColor = "";
            locationInfo.style.color = "";
            userEmail = '';
            captureTime = '';
            userLocation = '';
            showStep(initialStep);
        });