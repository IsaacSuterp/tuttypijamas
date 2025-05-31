// database.js
// Agora buscando imagens da pasta local assets/images/
// CERTIFIQUE-SE DE QUE VOCÊ TEM AS IMAGENS CORRESPONDENTES NESTA PASTA!

const products = [
    {
        id: 1,
        name: "Pijama de Seda Clássico",
        price: 259.90,
        installments: 10,
        category: "feminino",
        style: "manga longa",
        fabric: "seda",
        color: "preto",
        sizes: ["P", "M", "G"],
        images: [
            "assets/images/produto-1-img1.jpg", // Ex: pijama-seda-preto-frente.jpg
            "assets/images/produto-1-img2.jpg"  // Ex: pijama-seda-preto-detalhe.jpg
        ],
        description: "Pijama de seda pura com toque suave e caimento perfeito. Ideal para noites de luxo e conforto. Composição: 100% Seda.",
        rating: 4.9,
        reviews: 3,
        customerReviews: [
            { user: "Ana P.", stars: 5, comment: "Simplesmente perfeito! A seda é de altíssima qualidade e o caimento é impecável. Vale cada centavo.", date: "2025-05-15" },
            { user: "Carlos S.", stars: 4, comment: "Muito confortável e elegante. Apenas achei a cor um pouco diferente da foto, mas ainda assim, excelente.", date: "2025-05-20" },
            { user: "Mariana L.", stars: 5, comment: "Amei demais! Super recomendo, qualidade incrível.", date: "2025-05-25" }
        ]
    },
    {
        id: 2,
        name: "Pijama de Algodão Estampado",
        price: 129.90,
        installments: 6,
        category: "feminino",
        style: "manga curta",
        fabric: "algodao",
        color: "azul",
        sizes: ["P", "M", "G", "GG"],
        images: [
            "assets/images/produto-2-img1.jpg", // Ex: pijama-algodao-azul-frente.jpg
            "assets/images/produto-2-img2.jpg"  // Ex: pijama-algodao-azul-costas.jpg
        ],
        description: "Confortável e divertido, este pijama de algodão estampado é perfeito para o dia a dia. Composição: 100% Algodão.",
        rating: 4.5,
        reviews: 1,
        customerReviews: [
            { user: "Beatriz M.", stars: 4, comment: "Gostei da estampa, bem alegre. O algodão é macio.", date: "2025-04-10" }
        ]
    },
    {
        id: 3,
        name: "Pijama Masculino Flanelado",
        price: 189.90,
        installments: 8,
        category: "masculino",
        style: "manga longa",
        fabric: "flanela",
        color: "vermelho",
        sizes: ["M", "G", "GG"],
        images: [
            "assets/images/produto-3-img1.jpg",
            "assets/images/produto-3-img2.jpg"
        ],
        description: "Mantenha-se aquecido com nosso pijama de flanela xadrez. Perfeito para noites frias. Composição: 80% Algodão, 20% Poliéster.",
        rating: 0,
        reviews: 0,
        customerReviews: []
    },
    {
        id: 4,
        name: "Pijama Infantil Dinossauros",
        price: 99.90,
        installments: 5,
        category: "infantil",
        style: "manga longa",
        fabric: "algodao",
        color: "verde",
        sizes: ["2", "4", "6", "8"],
        images: [
            "assets/images/produto-4-img1.jpg",
            "assets/images/produto-4-img2.jpg" // Se tiver uma segunda imagem, senão remova
        ],
        description: "As crianças vão amar este pijama que brilha no escuro com estampa de dinossauros. Composição: 100% Algodão.",
        rating: 5,
        reviews: 1,
        customerReviews: [
            { user: "Mamãe Coruja", stars: 5, comment: "Meu filho não quer tirar! Adorou que brilha no escuro.", date: "2025-05-01" }
        ]
    },
    {
        id: 5,
        name: "Robe de Cetim Floral",
        price: 179.90,
        installments: 7,
        category: "feminino",
        style: "robe",
        fabric: "cetim",
        color: "rosa",
        sizes: ["P", "M", "G"],
        images: [
            "assets/images/produto-5-img1.jpg"
            // Adicione mais imagens se tiver, ex: "assets/images/produto-5-img2.jpg"
        ],
        description: "Robe de cetim elegante com estampa floral delicada. Perfeito para momentos de relaxamento com um toque de sofisticação. Composição: 100% Poliéster Acetinado.",
        rating: 0,
        reviews: 0,
        customerReviews: []
    },
    {
        id: 6,
        name: "Pijama de Malha Listrado Masculino",
        price: 149.50,
        installments: 6,
        category: "masculino",
        style: "manga curta",
        fabric: "malha",
        color: "cinza",
        sizes: ["P", "M", "G", "GG"],
        images: [
            "assets/images/produto-6-img1.jpg"
        ],
        description: "Pijama masculino super confortável em malha de algodão com listras discretas. Ideal para o dia a dia e uma ótima noite de sono. Composição: 100% Algodão.",
        rating: 0,
        reviews: 0,
        customerReviews: []
    },
    {
        id: 7,
        name: "Camisola Infantil Princesa",
        price: 89.90,
        installments: 4,
        category: "infantil",
        style: "camisola",
        fabric: "algodao",
        color: "branco",
        sizes: ["4", "6", "8", "10"],
        images: [
            "assets/images/produto-7-img1.jpg"
        ],
        description: "Camisola encantadora para as pequenas princesas, feita em algodão macio com detalhes em renda e estampa delicada. Composição: 100% Algodão.",
        rating: 0,
        reviews: 0,
        customerReviews: []
    },
    {
        id: 8,
        name: "Pijama Americano Poá Feminino",
        price: 199.00,
        installments: 8,
        category: "feminino",
        style: "manga longa",
        fabric: "viscose",
        color: "marinho",
        sizes: ["PP", "P", "M", "G"],
        images: [
            "assets/images/produto-8-img1.jpg"
        ],
        description: "Clássico e charmoso, o pijama americano em viscose com estampa poá oferece conforto e estilo. Fechamento com botões e vivos contrastantes. Composição: 100% Viscose.",
        rating: 0,
        reviews: 0,
        customerReviews: []
    }
];
