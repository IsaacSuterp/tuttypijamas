// database.js
// Simulação de um banco de dados de produtos com imagens reais
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
            "https://images.unsplash.com/photo-1617304523733-2a91121a2212?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
            "https://images.unsplash.com/photo-1617304523794-37839352b368?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
        ],
        description: "Pijama de seda pura com toque suave e caimento perfeito. Ideal para noites de luxo e conforto. Composição: 100% Seda.",
        rating: 4.9, // Pode ser a média calculada das 'stars' abaixo
        reviews: 3,  // Pode ser product.customerReviews.length
        customerReviews: [
            {
                user: "Ana P.",
                stars: 5,
                comment: "Simplesmente perfeito! A seda é de altíssima qualidade e o caimento é impecável. Vale cada centavo.",
                date: "2025-05-15"
            },
            {
                user: "Carlos S.",
                stars: 4,
                comment: "Muito confortável e elegante. Apenas achei a cor um pouco diferente da foto, mas ainda assim, excelente.",
                date: "2025-05-20"
            },
            {
                user: "Mariana L.",
                stars: 5,
                comment: "Amei demais! Super recomendo, qualidade incrível.",
                date: "2025-05-25"
            }
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
            "https://images.unsplash.com/photo-1590371454242-deae33658673?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
            "https://images.unsplash.com/photo-1601618776659-328551be135b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
        ],
        description: "Confortável e divertido, este pijama de algodão estampado é perfeito para o dia a dia. Composição: 100% Algodão.",
        rating: 4.5,
        reviews: 1,
        customerReviews: [
            {
                user: "Beatriz M.",
                stars: 4,
                comment: "Gostei da estampa, bem alegre. O algodão é macio.",
                date: "2025-04-10"
            }
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
            "https://images.unsplash.com/photo-1610652758838-3904f44fa493?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
            "https://images.unsplash.com/photo-1640961816335-462a4bce578a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
        ],
        description: "Mantenha-se aquecido com nosso pijama de flanela xadrez. Perfeito para noites frias. Composição: 80% Algodão, 20% Poliéster.",
        rating: 0, // Sem avaliações ainda
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
            "https://images.unsplash.com/photo-1594864853247-49344488a82a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
            "https://images.unsplash.com/photo-1594864853247-49344488a82a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
        ],
        description: "As crianças vão amar este pijama que brilha no escuro com estampa de dinossauros. Composição: 100% Algodão.",
        rating: 5,
        reviews: 1,
        customerReviews: [
            {
                user: "Mamãe Coruja",
                stars: 5,
                comment: "Meu filho não quer tirar! Adorou que brilha no escuro.",
                date: "2025-05-01"
            }
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
            "https://images.unsplash.com/photo-1570293998683-99d8a39a6797?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
            "https://images.unsplash.com/photo-1570293998683-99d8a39a6797?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
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
            "https://images.unsplash.com/photo-1618521079869-42b719463f0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
            "https://images.unsplash.com/photo-1618521079869-42b719463f0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
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
            "https://images.unsplash.com/photo-1610480356535-7769ba8b8a69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
            "https://images.unsplash.com/photo-1610480356535-7769ba8b8a69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
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
            "https://images.unsplash.com/photo-1585255314169-958801a6b225?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
            "https://images.unsplash.com/photo-1585255314169-958801a6b225?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
        ],
        description: "Clássico e charmoso, o pijama americano em viscose com estampa poá oferece conforto e estilo. Fechamento com botões e vivos contrastantes. Composição: 100% Viscose.",
        rating: 0,
        reviews: 0,
        customerReviews: []
    }
];
