// Simulação de um banco de dados de produtos
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
        images: ["images/pijama-seda-preto-1.jpg", "images/pijama-seda-preto-2.jpg"],
        description: "Pijama de seda pura com toque suave e caimento perfeito. Ideal para noites de luxo e conforto. Composição: 100% Seda.",
        rating: 4.8,
        reviews: 23
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
        images: ["images/pijama-algodao-azul-1.jpg", "images/pijama-algodao-azul-2.jpg"],
        description: "Confortável e divertido, este pijama de algodão estampado é perfeito para o dia a dia. Composição: 100% Algodão.",
        rating: 4.5,
        reviews: 45
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
        images: ["images/pijama-flanela-vermelho-1.jpg", "images/pijama-flanela-vermelho-2.jpg"],
        description: "Mantenha-se aquecido com nosso pijama de flanela xadrez. Perfeito para noites frias. Composição: 80% Algodão, 20% Poliéster.",
        rating: 4.7,
        reviews: 18
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
        images: ["images/pijama-infantil-dino-1.jpg", "images/pijama-infantil-dino-2.jpg"],
        description: "As crianças vão amar este pijama que brilha no escuro com estampa de dinossauros. Composição: 100% Algodão.",
        rating: 4.9,
        reviews: 52
    }
];
