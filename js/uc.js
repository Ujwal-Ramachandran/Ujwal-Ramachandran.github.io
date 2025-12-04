document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURATION ---
    const pandaImg = document.getElementById('panda-actor');
    const dialogueBox = document.getElementById('panda-dialogue');
    
    // Path Prefix
    const assetPath = 'style/under construction/';
    
    // Messages
    const messages = [
        "Gomen nasai! 🙇<br>My crew is working hard to compile this section!",
        "I promise it will be worth the wait!<br>Please don't be mad! 🥺",
        "Just a few more pixels...<br>We are building as fast as we can! 🏗️",
        "System upgrade in progress...<br>Sorry for the mess!!! 🔧",
    ];

    let msgIndex = 0;

    // --- PANDA STATE MACHINE ---
    function setPandaState() {
        // 1. Normal
        pandaImg.src = `${assetPath}Red Panda.png`;
        pandaImg.classList.remove('shake-anim');
        
        setTimeout(() => {
            // 2. Tearing Up
            pandaImg.src = `${assetPath}Panda - Stand.png`;
            
            setTimeout(() => {
                // 3. Bow Left
                pandaImg.src = `${assetPath}Panda - Bow - Left.png`;
                pandaImg.classList.add('shake-anim');
                
                setTimeout(() => {
                    // 4. Teary (Brief pause)
                    pandaImg.classList.remove('shake-anim');
                    pandaImg.src = `${assetPath}Panda - Stand.png`;
                    
                    setTimeout(() => {
                        // 5. Bow Right
                        pandaImg.src = `${assetPath}Panda - Bow - Right.png`;
                        pandaImg.classList.add('shake-anim');
                        
                        setTimeout(() => {
                            // 6. Reset & Update Text
                            updateDialogue();
                            setPandaState(); 
                            
                        }, 1000); 
                    }, 1500); 
                }, 1000); 
            }, 1500); 
        }, 1000); 
    }

    function updateDialogue() {
        msgIndex = (msgIndex + 1) % messages.length;
        dialogueBox.style.opacity = 0;
        setTimeout(() => {
            dialogueBox.innerHTML = messages[msgIndex];
            dialogueBox.style.opacity = 1;
        }, 200);
    }

    // --- SPARK SYSTEM ---
    const particlesContainer = document.getElementById('particles-container');

    function createSpark() {
        const spark = document.createElement('div');
        spark.classList.add('particle');
        
        const startX = Math.random() * 100; 
        const startY = Math.random() * 100;
        
        spark.style.left = startX + '%';
        spark.style.top = startY + '%';
        spark.style.backgroundColor = Math.random() > 0.5 ? '#ffff00' : '#00ff9f';
        spark.style.boxShadow = '0 0 5px ' + spark.style.backgroundColor;
        
        const destX = (Math.random() - 0.5) * 50;
        const destY = (Math.random() - 0.5) * 50;
        
        spark.animate([
            { transform: 'translate(0,0)', opacity: 1 },
            { transform: `translate(${destX}px, ${destY}px)`, opacity: 0 }
        ], {
            duration: 500 + Math.random() * 500,
            easing: 'ease-out'
        });
        
        particlesContainer.appendChild(spark);
        setTimeout(() => spark.remove(), 1000);
    }

    setPandaState();
    setInterval(createSpark, 150); 
});