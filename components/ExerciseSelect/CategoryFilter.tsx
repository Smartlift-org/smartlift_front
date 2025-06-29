import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";

type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      onSelectCategory(null);
    } else {
      onSelectCategory(category);
    }
  };

  const renderCategoryButton = (category: string) => {
    const isSelected = selectedCategory === category;
    return (
      <TouchableOpacity
        key={category}
        style={{
          marginRight: 8,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
          borderWidth: isSelected ? 0 : 1,
          borderColor: isSelected ? 'transparent' : '#d1d5db',
          minWidth: category.length * 8, 
          maxWidth: 200
        }}
        onPress={() => handleCategoryPress(category)}
      >
        <Text
          style={{
            color: isSelected ? '#ffffff' : '#1f2937',
            textAlign: 'center',
            fontWeight: isSelected ? '600' : 'normal',
            fontSize: 14
          }}
          numberOfLines={1}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3 p-2"
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {categories.map((category) => renderCategoryButton(category))}
      </ScrollView>
    </View>
  );
};

export default CategoryFilter;
