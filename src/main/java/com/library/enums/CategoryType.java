package com.library.enums;

public enum CategoryType {
    LITERATURE("Literature", "Novels, short stories, poetry"),
    ECONOMICS("Economics", "Books on economics, finance, investment"),
    LIFE_SKILLS("Life Skills", "Personal development, soft skills"),
    SCIENCE("Science", "Natural science, physics, chemistry, biology"),
    TECHNOLOGY("Technology", "Information technology, programming, AI"),
    HISTORY("History", "Vietnamese and world history books"),
    PSYCHOLOGY("Psychology", "Psychology, psychotherapy"),
    PHILOSOPHY("Philosophy", "Eastern and Western philosophy"),
    CHILDREN("Children", "Books for children"),
    COMICS("Comics", "Manga, comic, Vietnamese comics"),
    TEXTBOOK("Textbook", "Textbooks for all levels"),
    LANGUAGES("Languages", "Learn English, Japanese, Korean..."),
    MEDICINE("Medicine", "Medical and health books"),
    ART("Art", "Painting, music, cinema"),
    TRAVEL("Travel", "Travel guides, exploration"),
    COOKING("Cooking", "Cookbooks, regional cuisine"),
    BUSINESS("Business", "Management, entrepreneurship, marketing"),
    RELIGION("Religion", "Buddhism, Christianity, spirituality"),
    SPORTS("Sports", "Sports books, fitness"),
    POLITICS_LAW("Politics - Law", "Books on politics, law");

    private final String displayName;
    private final String description;

    CategoryType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}