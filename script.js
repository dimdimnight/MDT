document.addEventListener('DOMContentLoaded', () => {
    // 1. Digital Clock
    const updateTime = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fr-FR', { hour12: false });
        const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        document.getElementById('current-time').textContent = timeStr;
        document.getElementById('current-date').textContent = dateStr;
    };
    setInterval(updateTime, 1000);
    updateTime();

    // 2. Login & Boot Sequence Simulation
    let accounts = JSON.parse(localStorage.getItem('lspd_accounts')) || [];
    let rapports = JSON.parse(localStorage.getItem('lspd_rapports')) || [];
    let plaintes = JSON.parse(localStorage.getItem('lspd_plaintes')) || [];

    // Ensure default accounts exist
    const defaultAdmin = { matricule: 'Rancune', name: 'Superviseur Rancune', password: '19631123', role: 'admin', status: 'approved', rank: 'Chief', service: 'LSPD', dutyStatus: 'offline' };
    const defaultOfficer = { matricule: '412', name: 'J. Doe', password: '123', role: 'officer', status: 'approved', rank: 'Officier II', service: 'LSPD', dutyStatus: 'offline' };
    
    if (!accounts.find(a => a.matricule === 'Rancune')) accounts.push(defaultAdmin);
    if (!accounts.find(a => a.matricule === '412')) accounts.push(defaultOfficer);

    function saveAccounts() {
        localStorage.setItem('lspd_accounts', JSON.stringify(accounts));
    }

    let currentUser = null;

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginScreen = document.getElementById('login-screen');
    const bootScreen = document.getElementById('boot-screen');
    const mainApp = document.getElementById('main-app');

    window.switchLoginTab = function(tab) {
        const tabs = document.querySelectorAll('.login-tab');
        showMsg('', '');
        
        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            tabs[0].classList.add('active');
            tabs[1].classList.remove('active');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            tabs[0].classList.remove('active');
            tabs[1].classList.add('active');
        }
    };

    function showMsg(type, msg) {
        const err = document.getElementById('login-error');
        const suc = document.getElementById('login-success');
        err.classList.add('hidden'); suc.classList.add('hidden');
        
        if (type === 'error') { err.textContent = msg; err.classList.remove('hidden'); }
        else if (type === 'success') { suc.textContent = msg; suc.classList.remove('hidden'); }
    }

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const matricule = document.getElementById('reg-matricule').value.trim();
        const name = document.getElementById('reg-name').value.trim();
        const pass = document.getElementById('reg-password').value;
        const rank = document.getElementById('reg-rank').value;
        const service = document.getElementById('reg-service').value;

        if (accounts.find(a => a.matricule === matricule)) {
            showMsg('error', 'Ce matricule existe déjà.');
            return;
        }

        accounts.push({ matricule, name, password: pass, rank: rank, service: service, role: 'officer', status: 'pending', dutyStatus: 'offline' });
        saveAccounts();
        
        registerForm.reset();
        window.switchLoginTab('login');
        showMsg('success', 'Demande envoyée, en attente de validation par un superviseur.');
        renderAdminPanel();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value;

        const acc = accounts.find(a => a.matricule === user && a.password === pass);

        if (acc) {
            if (acc.status === 'pending') {
                showMsg('error', 'Votre compte est en attente de validation.');
            } else if (acc.status === 'rejected') {
                showMsg('error', 'Votre demande de compte a été refusée.');
            } else {
                currentUser = acc;
                // Set default duty to available upon login
                acc.dutyStatus = 'available';
                saveAccounts();
                document.getElementById('status-select').value = 'available';
                document.getElementById('status-indicator').className = 'status-dot available';

                loginScreen.classList.add('hidden');
                bootScreen.classList.remove('hidden');
                
                // Update UI with officer info and service
                const serviceStr = acc.service || 'LSPD';
                const lspdLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Los_Santos_Police_Department_Logo.png/600px-Los_Santos_Police_Department_Logo.png";
                const bcsoLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Los_Angeles_County_Sheriff%27s_Department_logo.svg/600px-Los_Angeles_County_Sheriff%27s_Department_logo.svg.png";
                const dojLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Seal_of_the_State_of_California.svg/600px-Seal_of_the_State_of_California.svg.png";
                
                const bootLogo = document.getElementById('boot-logo');
                const sidebarLogo = document.getElementById('sidebar-logo');
                const sidebarTitle = document.getElementById('sidebar-title');

                if (serviceStr === 'BCSO') {
                    if(bootLogo) bootLogo.src = bcsoLogoUrl;
                    if(sidebarLogo) sidebarLogo.src = bcsoLogoUrl;
                    if(sidebarTitle) sidebarTitle.innerText = "M.D.T.";
                } else if (serviceStr === 'DOJ') {
                    if(bootLogo) bootLogo.src = dojLogoUrl;
                    if(sidebarLogo) sidebarLogo.src = dojLogoUrl;
                    if(sidebarTitle) sidebarTitle.innerText = "D.O.J.";
                } else {
                    if(bootLogo) bootLogo.src = lspdLogoUrl;
                    if(sidebarLogo) sidebarLogo.src = lspdLogoUrl;
                    if(sidebarTitle) sidebarTitle.innerText = "M.D.T.";
                }

                document.querySelector('.officer-details .badge').textContent = `Matricule #${acc.matricule}`;
                document.querySelector('.officer-details .name').textContent = `[${serviceStr}] ${acc.rank} ${acc.name}`;
                
                // Show admin panel if admin
                if (acc.role === 'admin') {
                    document.getElementById('nav-admin').classList.remove('hidden');
                } else {
                    document.getElementById('nav-admin').classList.add('hidden');
                }

                renderAdminPanel();
                renderActiveUnits();
                renderRapports();
                bootSequence();
            }
        } else {
            showMsg('error', 'Identifiants incorrects.');
        }
    });

    window.renderActiveUnits = function() {
        const list = document.getElementById('active-units-list');
        if (!list) return;

        const active = accounts.filter(a => a.status === 'approved' && (a.dutyStatus === 'available' || a.dutyStatus === 'busy'));
        
        const countEl = document.getElementById('active-units-count');
        if (countEl) countEl.textContent = active.length;

        if (active.length === 0) {
            list.innerHTML = '<li class="placeholder-msg" style="padding:10px;">Aucun agent en service.</li>';
            return;
        }

        list.innerHTML = active.map(acc => `
            <li class="unit-item">
                <span class="status-dot ${acc.dutyStatus}"></span>
                <span class="unit-rank">${acc.rank || 'Off.'}</span>
                <span class="unit-name">${acc.name}</span>
                <span class="unit-badge">#${acc.matricule}</span>
            </li>
        `).join('');
    };

    window.renderLawyerDirectory = function() {
        const list = document.getElementById('lawyer-directory-list');
        if (!list) return;

        const dojMembers = accounts.filter(a => a.service === 'DOJ' && a.status === 'approved');
        
        if (dojMembers.length === 0) {
            list.innerHTML = '<li class="placeholder-msg">Aucun membre du DOJ enregistré.</li>';
            return;
        }

        list.innerHTML = dojMembers.map(m => `
            <li>
                <span class="status-dot ${m.dutyStatus === 'available' ? 'available' : 'busy'}"></span>
                <strong>${m.rank}</strong> ${m.name} 
                <span class="text-muted" style="float:right;">${m.dutyStatus === 'available' ? 'Disponible' : 'Indisponible'}</span>
            </li>
        `).join('');
    };

    window.renderAdminPanel = function() {
        const list = document.getElementById('pending-requests-list');
        if (!list) return;

        const pending = accounts.filter(a => a.status === 'pending');
        
        if (pending.length === 0) {
            list.innerHTML = '<div class="placeholder-msg">Aucune demande en attente.</div>';
            return;
        }

        list.innerHTML = pending.map(acc => `
            <div class="request-card">
                <div class="request-info">
                    <strong>[${acc.service}] ${acc.name}</strong>
                    <span>Matricule: #${acc.matricule} - ${acc.rank}</span>
                </div>
                <div class="request-actions">
                    <button class="btn btn-success btn-icon" title="Accepter" onclick="handleRequest('${acc.matricule}', 'approved')"><i class="fa-solid fa-check"></i></button>
                    <button class="btn btn-danger btn-icon" title="Refuser" onclick="handleRequest('${acc.matricule}', 'rejected')"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
        `).join('');
    };

    window.deleteRapport = function(id) {
        if(confirm("Êtes-vous sûr de vouloir supprimer ce rapport d'arrestation ?")) {
            rapports = rapports.filter(r => r.id !== id);
            localStorage.setItem('lspd_rapports', JSON.stringify(rapports));
            renderRapports();
        }
    };

    window.renderRapports = function() {
        const list = document.getElementById('reports-list');
        if (!list) return;

        if (rapports.length === 0) {
            list.innerHTML = `
                <div class="glass placeholder-box">
                    <i class="fa-solid fa-folder-open fa-3x"></i>
                    <p>Aucun rapport n'est enregistré dans la base de données.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = rapports.slice().reverse().map(r => {
            const photosHTML = Object.entries(r.photos).map(([cat, files]) => {
                if(files.length === 0) return '';
                const imgTags = files.map(f => `
                    <div style="display:inline-block; margin-right:10px; margin-top:5px; text-align:center;">
                        <img src="${f.data}" alt="${f.name}" style="max-height: 100px; border-radius: 4px; border: 1px solid var(--border-glass);">
                        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${f.name}</div>
                    </div>
                `).join('');
                return `<div style="margin-top:10px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);"><strong>${cat} :</strong><br>${imgTags}</div>`;
            }).join('');

            return `
            <div class="glass widget" style="margin-bottom: 15px;">
                <div style="display:flex; justify-content: space-between; align-items:flex-start; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px;">
                    <div>
                        <h4 style="color:var(--primary); margin:0;">Rapport d'Arrestation - ${r.nom}</h4>
                        <span style="color:var(--text-muted); font-size:0.9rem;">Rédigé le ${r.dateRedaction} par #${r.agentRedac}</span>
                    </div>
                    <button class="btn btn-danger btn-icon" title="Supprimer" onclick="deleteRapport(${r.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size:0.9rem;">
                    <div><strong>Date des faits :</strong> ${r.dateFaits}</div>
                    <div><strong>N° Sécu :</strong> ${r.secu}</div>
                    <div><strong>Amende :</strong> <span style="color:var(--danger);">$${r.amende}</span></div>
                    <div><strong>Prison :</strong> <span style="color:var(--warning);">${r.prison} mois</span></div>
                </div>
                <div style="margin-top: 10px; font-size:0.9rem;">
                    <strong>Chefs d'accusation :</strong><br>
                    <pre style="font-family:inherit; white-space: pre-wrap; margin-top:5px; margin-bottom: 10px; color:var(--warning);">${r.accusations}</pre>
                    
                    <strong>Faits :</strong><br>
                    <pre style="font-family:inherit; white-space: pre-wrap; margin-top:5px; margin-bottom: 10px;">${r.faits}</pre>
                    
                    ${photosHTML ? `<div style="margin-top:15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top:10px;"><strong>Fichiers joints :</strong>${photosHTML}</div>` : ''}
                </div>
            </div>
        `}).join('');
    };

    // Plaintes rendering
    window.renderPlaintes = function() {
        const container = document.getElementById('plaintes-container');
        if (!container) return;
        
        container.innerHTML = '';
        if (plaintes.length === 0) {
            container.innerHTML = '<p class="text-muted text-center" style="grid-column: 1/-1; padding: 20px;">Aucune plainte enregistrée.</p>';
            return;
        }

        plaintes.forEach((plainte, index) => {
            const card = document.createElement('div');
            card.className = 'glass widget report-card';
            
            let preuvesHtml = '';
            if (plainte.preuves && plainte.preuves.length > 0) {
                preuvesHtml += `<div class="report-images"><h5 class="mt-10" style="color:var(--primary);">Preuves :</h5><div class="img-grid">`;
                plainte.preuves.forEach(img => {
                    preuvesHtml += `<img src="${img}" alt="Preuve" class="report-thumbnail" onclick="window.open('${img}')">`;
                });
                preuvesHtml += `</div></div>`;
            }

            let idCardHtml = '';
            if (plainte.idCardBase64) {
                idCardHtml = `<h5 class="mt-10" style="color:var(--primary);">Pièce d'identité du plaignant :</h5>
                              <img src="${plainte.idCardBase64}" alt="ID Plaignant" class="report-thumbnail" onclick="window.open('${plainte.idCardBase64}')">`;
            }

            card.innerHTML = `
                <div class="report-card-header">
                    <h4>Plainte #${index + 1000} - Victime: ${plainte.v_nom}</h4>
                    <button class="btn btn-icon btn-danger btn-sm" onclick="deletePlainte(${index})" title="Supprimer la plainte"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="report-card-body" style="font-size: 0.9rem;">
                    <p><strong>Date de la plainte :</strong> ${plainte.timestamp}</p>
                    <p><strong>Date des faits :</strong> ${plainte.date_faits}</p>
                    <hr style="border-color: rgba(255,255,255,0.1); margin: 10px 0;">
                    
                    <div style="display:flex; gap: 20px; margin-bottom: 15px;">
                        <div style="flex:1;">
                            <h5 style="color:var(--primary);">Victime</h5>
                            <p>Nom: ${plainte.v_nom}</p>
                            <p>DDN: ${plainte.v_ddn} | Sécu: ${plainte.v_secu}</p>
                            <p>Natio: ${plainte.v_natio} | Tel: ${plainte.v_tel}</p>
                            <p>Adresse: ${plainte.v_adresse}</p>
                            <p>Travail: ${plainte.v_travail}</p>
                        </div>
                        <div style="flex:1;">
                            <h5 style="color:var(--primary);">Suspect</h5>
                            <p>Nom: ${plainte.s_nom || 'Inconnu'}</p>
                            <p>DDN: ${plainte.s_ddn} | Sécu: ${plainte.s_secu}</p>
                            <p>Natio: ${plainte.s_natio} | Tel: ${plainte.s_tel}</p>
                            <p>Adresse: ${plainte.s_adresse}</p>
                            <p>Travail: ${plainte.s_travail}</p>
                        </div>
                    </div>

                    <p><strong>Faits problématiques :</strong><br><span style="white-space: pre-wrap; color: #ccc;">${plainte.faits_prob}</span></p>
                    <br>
                    <p><strong>Description de l'incident :</strong><br><span style="white-space: pre-wrap; color: #ccc;">${plainte.description}</span></p>
                    
                    ${idCardHtml}
                    ${preuvesHtml}
                </div>
                <div class="report-card-footer text-muted" style="margin-top:15px; font-size:0.8rem;">
                    <em>Agent Rédacteur : Off. ${plainte.officerName} (Matricule: ${plainte.officerMatricule}) - ${plainte.officerService || 'LSPD'} | Grade: ${plainte.officerRank}</em>
                </div>
            `;
            container.appendChild(card);
        });
    };

    window.deletePlainte = function(index) {
        if(confirm("Attention ! Voulez-vous vraiment supprimer définitivement cette plainte ?")) {
            plaintes.splice(index, 1);
            localStorage.setItem('lspd_plaintes', JSON.stringify(plaintes));
            renderPlaintes();
        }
    };

    // Forms Handlers
    const bordereauForm = document.getElementById('bordereau-form');
    if (bordereauForm) {
        bordereauForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const rapport = {
                id: Date.now(),
                dateRedaction: document.getElementById('bord-date-redac').value,
                dateFaits: document.getElementById('bord-date-faits').value,
                agentRedac: document.getElementById('bord-agent-redac').value,
                agentsPres: document.getElementById('bord-agents-pres').value,
                nom: document.getElementById('bord-nom').value,
                dob: document.getElementById('bord-dob').value,
                secu: document.getElementById('bord-id').value,
                tel: document.getElementById('bord-tel').value,
                empreinte: document.getElementById('bord-empreinte').value,
                miranda: document.getElementById('bord-miranda').value,
                accusations: document.getElementById('bord-accusations').value,
                saisiesTxt: document.getElementById('bord-saisies').value,
                faits: document.getElementById('bord-faits').value,
                amende: document.getElementById('bord-amende').value,
                prison: document.getElementById('bord-prison').value,
                photos: {}
            };
            
            const fileInputs = bordereauForm.querySelectorAll('.file-upload');
            const photoPromises = [];

            fileInputs.forEach(input => {
                if(input.files.length > 0) {
                    const cat = input.dataset.category;
                    if(!rapport.photos[cat]) rapport.photos[cat] = [];

                    Array.from(input.files).forEach(file => {
                        const promise = new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                rapport.photos[cat].push({ name: file.name, data: e.target.result });
                                resolve();
                            };
                            reader.readAsDataURL(file);
                        });
                        photoPromises.push(promise);
                    });
                }
            });

            Promise.all(photoPromises).then(() => {
                try {
                    rapports.push(rapport);
                    localStorage.setItem('lspd_rapports', JSON.stringify(rapports));
                    alert("Rapport d'arrestation enregistré avec succès dans la base de données !");
                    e.target.reset();
                    renderRapports();
                } catch (err) {
                    alert("Erreur: Les images sont trop volumineuses. Essayez avec des images plus petites.");
                }
            });
        });
    }

    const plainteForm = document.getElementById('plainte-form');
    if (plainteForm) {
        // Auto fill creation date
        const dateCreationInput = document.getElementById('plainte-date-creation');
        if(dateCreationInput) {
            dateCreationInput.value = new Date().toLocaleString('fr-FR');
        }

        plainteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const officerName = currentUser ? currentUser.name : "Inconnu";
            const officerRank = currentUser ? currentUser.rank : "Inconnu";
            const officerMatricule = currentUser ? currentUser.matricule : "Inconnu";
            
            const plainte = {
                timestamp: new Date().toLocaleString('fr-FR'),
                date_faits: document.getElementById('plainte-date-faits').value,
                
                v_nom: document.getElementById('plainte-v-nom').value,
                v_ddn: document.getElementById('plainte-v-ddn').value,
                v_secu: document.getElementById('plainte-v-secu').value,
                v_natio: document.getElementById('plainte-v-natio').value,
                v_tel: document.getElementById('plainte-v-tel').value,
                v_adresse: document.getElementById('plainte-v-adresse').value,
                v_travail: document.getElementById('plainte-v-travail').value,

                s_nom: document.getElementById('plainte-s-nom').value,
                s_ddn: document.getElementById('plainte-s-ddn').value,
                s_secu: document.getElementById('plainte-s-secu').value,
                s_natio: document.getElementById('plainte-s-natio').value,
                s_tel: document.getElementById('plainte-s-tel').value,
                s_adresse: document.getElementById('plainte-s-adresse').value,
                s_travail: document.getElementById('plainte-s-travail').value,

                faits_prob: document.getElementById('plainte-faits-prob').value,
                description: document.getElementById('plainte-description').value,

                officerName: officerName,
                officerRank: officerRank,
                officerMatricule: officerMatricule,
                officerService: currentUser ? (currentUser.service || 'LSPD') : 'LSPD',
                
                idCardBase64: null,
                preuves: []
            };

            const readAsDataURL = (file) => new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(file);
            });

            // Process ID card
            const idCardInput = document.getElementById('plainte-id-card');
            if (idCardInput.files.length > 0) {
                plainte.idCardBase64 = await readAsDataURL(idCardInput.files[0]);
            }

            // Process Preuves
            const preuvesInput = document.getElementById('plainte-preuves');
            if (preuvesInput.files.length > 0) {
                for (let file of Array.from(preuvesInput.files)) {
                    plainte.preuves.push(await readAsDataURL(file));
                }
            }

            try {
                plaintes.push(plainte);
                localStorage.setItem('lspd_plaintes', JSON.stringify(plaintes));
                alert("Plainte enregistrée avec succès !");
                e.target.reset();
                if(dateCreationInput) dateCreationInput.value = new Date().toLocaleString('fr-FR');
                renderPlaintes();
                switchView('plaintes-list');
            } catch (err) {
                alert("Erreur de stockage : Images trop lourdes. Veuillez compresser vos images ou en mettre moins.");
            }
        });
    }

    window.handleRequest = function(matricule, action) {
        const acc = accounts.find(a => a.matricule === matricule);
        if (acc) {
            acc.status = action;
            saveAccounts();
            renderAdminPanel();
        }
    }

    // Sync between tabs in real-time
    window.addEventListener('storage', (e) => {
        if (e.key === 'lspd_accounts') {
            accounts = JSON.parse(e.newValue) || [];
            if (typeof renderAdminPanel === 'function') renderAdminPanel();
            if (typeof renderActiveUnits === 'function') renderActiveUnits();
        }
        if (e.key === 'lspd_rapports') {
            rapports = JSON.parse(e.newValue) || [];
            if (typeof renderRapports === 'function') renderRapports();
        }
        if (e.key === 'lspd_plaintes') {
            plaintes = JSON.parse(e.newValue) || [];
            if (typeof renderPlaintes === 'function') renderPlaintes();
        }
    });

    const bootSequence = async () => {
        const terminalText = document.getElementById('terminal-text');
        const progressBar = document.getElementById('boot-progress');
        const barInner = progressBar.querySelector('.progress-bar');
        
        const bootLines = [
            "> MDT_OS_KERNEL loading...",
            "> Establishing secure connection to Central Server...",
            "> Encrypting data stream...",
            "> Verifying Officer Credentials...",
            "> Authentication Successful. Welcome."
        ];

        let i = 0;
        const typeLine = () => {
            if (i < bootLines.length) {
                const p = document.createElement('p');
                p.textContent = bootLines[i];
                terminalText.appendChild(p);
                i++;
                setTimeout(typeLine, Math.random() * 400 + 200);
            } else {
                // Show progress bar
                progressBar.classList.remove('hidden');
                setTimeout(() => { barInner.style.width = '100%'; }, 100);
                
                setTimeout(() => {
                    document.getElementById('boot-screen').style.opacity = '0';
                    setTimeout(() => {
                        document.getElementById('boot-screen').classList.add('hidden');
                        document.getElementById('main-app').classList.remove('hidden');
                    }, 500);
                }, 1000);
            }
        };
        setTimeout(typeLine, 500);
    };

    // 3. Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    window.switchView = function(targetId) {
        navBtns.forEach(b => b.classList.remove('active'));
        const targetBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
        if (targetBtn) targetBtn.classList.add('active');

        views.forEach(v => v.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
    };

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            switchView(targetId);
        });
    });

    // 4. Status Indicator
    const statusSelect = document.getElementById('status-select');
    const statusDot = document.getElementById('status-indicator');
    
    statusSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        statusDot.className = 'status-dot'; // reset
        statusDot.classList.add(val);
        
        if (currentUser) {
            currentUser.dutyStatus = val;
            const idx = accounts.findIndex(a => a.matricule === currentUser.matricule);
            if (idx !== -1) {
                accounts[idx] = currentUser;
                saveAccounts();
                renderActiveUnits();
            }
        }
    });

    // Quick Search Tabs
    const searchTabs = document.querySelectorAll('.tab-btn');
    searchTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            searchTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Calculator Logic
    const calcCheckboxes = document.querySelectorAll('.calc-item input[type="checkbox"]');
    const calcAmendeEl = document.getElementById('calc-total-amende');
    const calcPrisonEl = document.getElementById('calc-total-prison');
    const calcSelectedList = document.getElementById('calc-selected-list');

    function updateCalculator() {
        let totalAmende = 0;
        let totalPrison = 0;
        let selected = [];

        calcCheckboxes.forEach(cb => {
            if (cb.checked) {
                totalAmende += parseInt(cb.dataset.amende);
                totalPrison += parseInt(cb.dataset.prison);
                selected.push(cb.value);
            }
        });

        calcAmendeEl.textContent = totalAmende;
        calcPrisonEl.textContent = totalPrison;

        if (selected.length === 0) {
            calcSelectedList.innerHTML = '<li class="text-muted" style="list-style:none;">Aucune infraction sélectionnée</li>';
        } else {
            calcSelectedList.innerHTML = selected.map(item => `<li>${item}</li>`).join('');
        }
    }

    calcCheckboxes.forEach(cb => cb.addEventListener('change', updateCalculator));

    window.resetCalculator = function() {
        calcCheckboxes.forEach(cb => cb.checked = false);
        updateCalculator();
    };

    window.transferToBordereau = function() {
        let totalAmende = parseInt(calcAmendeEl.textContent);
        let totalPrison = parseInt(calcPrisonEl.textContent);
        
        let selected = [];
        calcCheckboxes.forEach(cb => {
            if (cb.checked) selected.push(cb.value);
        });

        if (selected.length === 0) {
            alert("Veuillez sélectionner au moins une infraction.");
            return;
        }

        // Fill bordereau
        document.getElementById('bord-amende').value = totalAmende;
        document.getElementById('bord-prison').value = totalPrison;
        
        const accusationsTxt = selected.map(item => `- ${item}`).join('\n');
        document.getElementById('bord-accusations').value = accusationsTxt;

        // Switch View
        switchView('bordereaux');
        alert("Informations transférées ! Veuillez compléter le reste du bordereau.");
    };

    // Calculator Live Search Filter
    const calcSearchInput = document.getElementById('calc-search-input');
    if (calcSearchInput) {
        calcSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const groups = document.querySelectorAll('.calc-group');
            
            groups.forEach(group => {
                let hasVisibleItems = false;
                const items = group.querySelectorAll('.calc-item');
                
                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(query)) {
                        item.style.display = 'flex';
                        hasVisibleItems = true;
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                if (hasVisibleItems) {
                    group.style.display = 'block';
                } else {
                    group.style.display = 'none';
                }
            });
        });
    }
});

// Logout Simulation
window.logoutMDT = function() {
    if(confirm("Êtes-vous sûr de vouloir vous déconnecter du terminal ?")) {
        // Hide main app
        document.getElementById('main-app').classList.add('hidden');
        // Clear terminal
        const terminalText = document.getElementById('terminal-text');
        if(terminalText) terminalText.innerHTML = '';
        const progressBar = document.getElementById('boot-progress');
        if(progressBar) progressBar.classList.add('hidden');
        
        // Show boot screen and reload after short delay to reset app state
        const bootScreen = document.getElementById('boot-screen');
        bootScreen.style.opacity = '1';
        bootScreen.classList.remove('hidden');
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
};

// Handle dynamic ranks based on service
window.updateRanks = function() {
    const service = document.getElementById('reg-service').value;
    const rankSelect = document.getElementById('reg-rank');
    rankSelect.innerHTML = '<option value="" disabled selected>Sélectionnez votre grade</option>';
    
    if (service === 'LSPD') {
        const lspdRanks = [
            "Rookie", "Officier I", "Officier II", "Officier III",
            "Senior Lead Officer (SLO)", "Sergent / Chef", "Lieutenant / Chef",
            "Capitaine", "Commandant", "Chief"
        ];
        lspdRanks.forEach(r => rankSelect.innerHTML += `<option value="${r}">${r}</option>`);
    } else if (service === 'BCSO') {
        const bcsoRanks = [
            "Cadet", "Deputy I", "Deputy II", "Deputy III",
            "SLD", "Sergent / Chef", "Lieutenant / Chef", "Capitaine", 
            "Sheriff Adjoint", "Sheriff"
        ];
        bcsoRanks.forEach(r => rankSelect.innerHTML += `<option value="${r}">${r}</option>`);
    } else if (service === 'DOJ') {
        const dojRanks = [
            "Procureur Général", "Procureur", "Juge Fédéral", "Juge", "Avocat"
        ];
        dojRanks.forEach(r => rankSelect.innerHTML += `<option value="${r}">${r}</option>`);
    }
};

// Citizen Search Simulation
window.searchCitizen = function() {
    const input = document.getElementById('citizen-search-input').value;
    const loading = document.getElementById('citizen-loading');
    const results = document.getElementById('citizen-results');

    if (input.trim() === '') return;

    results.classList.add('hidden');
    loading.classList.remove('hidden');

    // Simulate network request
    setTimeout(() => {
        loading.classList.add('hidden');
        results.classList.remove('hidden');
    }, 1200);
};

// Panic Button Simulation
window.triggerPanic = function() {
    const alertBar = document.getElementById('panic-button-alert');
    const btn = document.querySelector('.panic-btn');
    
    alertBar.classList.remove('hidden');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SIGNAL ENVOYÉ';
    btn.classList.replace('btn-danger', 'btn-warning');
    
    // Auto reset after 5 seconds
    setTimeout(() => {
        alertBar.classList.add('hidden');
        btn.innerHTML = '<i class="fa-solid fa-bell"></i> PANIC BUTTON';
        btn.classList.replace('btn-warning', 'btn-danger');
    }, 5000);
}
