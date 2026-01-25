export declare class CreateCategoryDto {
    name: string;
    nameAr?: string;
    active?: boolean;
}
export declare class UpdateCategoryDto {
    name?: string;
    nameAr?: string;
    active?: boolean;
}
export declare class CreateSubcategoryDto {
    categoryId: number;
    name: string;
    nameAr?: string;
    active?: boolean;
}
export declare class UpdateSubcategoryDto {
    categoryId?: number;
    name?: string;
    nameAr?: string;
    active?: boolean;
}
export declare class CreateItemTypeDto {
    subcategoryId: number;
    name: string;
    nameAr?: string;
    active?: boolean;
}
export declare class UpdateItemTypeDto {
    subcategoryId?: number;
    name?: string;
    nameAr?: string;
    active?: boolean;
}
