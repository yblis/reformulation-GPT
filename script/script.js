document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chat-form');
    const mytextInput = document.getElementById('mytext');
    const responseTextarea = document.getElementById('response');
    const loadingBarContainer = document.getElementById('loading-bar-container');
    const API_KEY = 'VOTRE API'; // OpenAI, GROQ Ollam... API
	
function animateLoadingBar() {
    const loadingBar = document.getElementById('loading-bar');
    loadingBar.style.width = '0%'; // Réinitialiser la largeur avant de commencer l'animation
    setTimeout(() => {
        loadingBar.style.width = '100%'; // Déclenche l'animation
    }, 10); // Un petit délai pour s'assurer que la réinitialisation de la largeur est rendue
}

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mytext = mytextInput.value.trim();
        const toneTags = Array.from(document.querySelectorAll('#tone-tags .tag.selected')).map(tag => tag.textContent);
        const lengthTags = Array.from(document.querySelectorAll('#length-tags .tag.selected')).map(tag => tag.textContent);
        const formatTags = Array.from(document.querySelectorAll('#format-tags .tag.selected')).map(tag => tag.textContent);
        
        if (!mytext) {
            responseTextarea.value = 'Please enter some text to reformulate.';
            return;
        }
        
        // Affiche la barre de chargement
        loadingBarContainer.style.display = 'block';

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', { // Openai API
			      // const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { // Groq API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', //openai API
                    // model: 'gpt-3.5-turbo-16k', //openai API
                    // model: 'llama2-70b-4096', // Groq API
                    // model: 'mixtral-8x7b-32768', // Groq API
                    messages: [{
                        role: 'user',
                        content: `Langue: Français. Je suis une IA et je vais reformuler le texte suivant en gardant le ton, la longueur et le format spécifiés.\n\nTexte à reformuler : ${mytext}\n\nTon : ${toneTags.join(', ')}\n\nLongueur : ${lengthTags.join(', ')}\n\nFormat : ${formatTags.join(', ')}`
                    }],
                    temperature: 0.7,
                    top_p: 0.9,
                    n: 1,
                    stream: false,
                    presence_penalty: 0.5,
                    frequency_penalty: 0.5
                })
            });

            if (response.ok) {
                const data = await response.json();
                responseTextarea.value = data.choices[0].message.content;
            } else {
                throw new Error('Network response was not ok.');
            }
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
            responseTextarea.value = 'Error: Unable to process your request.';
        } finally {
            // Cache la barre de chargement
            loadingBarContainer.style.display = 'none';
        }
    });


	// Écouteur d'événements pour la sélection des tags
	document.querySelectorAll('.tags').forEach(container => {
		container.addEventListener('click', function(e) {
			if (e.target.classList.contains('tag') && !e.target.classList.contains('add-new')) {
				// Désélectionnez tous les autres tags
				container.querySelectorAll('.tag').forEach(tag => {
					tag.classList.remove('selected');
				});
				// Sélectionnez le tag cliqué
				e.target.classList.add('selected');
			}
		});
	});
	
	// Ajouter l'écouteur d'événements pour le bouton Ajouter
    document.getElementById('add-button').addEventListener('click', addToPage);

    // Écouteur d'événements pour l'ajout de nouveaux tags
    document.querySelectorAll('.add-new').forEach(addButton => {
        addButton.addEventListener('click', function() {
            const inputId = addButton.getAttribute('data-for');
            const newTagInput = document.getElementById(inputId);
            newTagInput.style.display = 'inline-block';
            newTagInput.focus();
        });
    });

    // Écouteur d'événements pour la création de nouveaux tags par Entrée
    document.querySelectorAll('.new-tag-input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && input.value.trim()) {
                const newTagValue = input.value.trim();
                const newTag = document.createElement('span');
                newTag.className = 'tag selected';
                newTag.textContent = newTagValue;
                input.parentNode.insertBefore(newTag, input);
                input.value = ''; 
                input.style.display = 'none';
            }
        });
    });
});


function addToPage() {
    // Obtenir le texte de la réponse.
    const responseText = JSON.stringify(document.getElementById('response').value);
    
    // Exécuter un script dans l'onglet actif pour ajouter la réponse au champ de saisie en focus.
    chrome.tabs.executeScript({
        code: `document.activeElement.value += ${responseText};`
    });
}

function addToActiveInput() {
    const textToAdd = document.getElementById('response').value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "add_text_to_input", text: textToAdd});
    });
}

document.getElementById('add-button').addEventListener('click', addToActiveInput);


function showLoadingBar() {
    const loadingBarContainer = document.getElementById('loading-bar-container');
    loadingBarContainer.style.display = 'block';
    const loadingBar = document.getElementById('loading-bar');
    loadingBar.style.width = '100%';
}

function hideLoadingBar() {
    const loadingBar = document.getElementById('loading-bar');
    loadingBar.style.width = '0%';
    const loadingBarContainer = document.getElementById('loading-bar-container');
    setTimeout(() => loadingBarContainer.style.display = 'none', 400);
}
