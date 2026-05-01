'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { FolderPlus, Layers3, Loader2, Pencil, Search, Tag, Trash2, X, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchShopCategories } from '@/redux/categorySlice';
import { useAppDispatch } from '@/hooks/redux.hook';

type Category = {
	id: number;
	name: string;
	slug: string;
	shop_id: number;
	created_at: string;
	updated_at: string;
};

export default function AdminCategoriesPage() {
	const { domain } = useParams();
	const shopDomain = Array.isArray(domain) ? domain[0] : domain;
  const dispatch = useAppDispatch();

	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
	const [editingCategoryName, setEditingCategoryName] = useState('');
	const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
	const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

	const fetchCategories = useCallback(async () => {
		if (!shopDomain) return;

		try {
			setIsLoading(true);
			const { data } = await axios.get(`/api/shops/${shopDomain}/categories`);
			setCategories(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error('Error fetching categories:', error);
			toast.error('Failed to load categories.');
		} finally {
			setIsLoading(false);
		}
	}, [shopDomain]);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const filteredCategories = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return categories;

		return categories.filter((category) =>
			`${category.name} ${category.slug}`.toLowerCase().includes(query),
		);
	}, [categories, searchQuery]);

	const handleCreateCategory = async (e: React.FormEvent) => {
		e.preventDefault();

		const name = newCategoryName.trim();
		if (name.length < 2) {
			toast.error('Category name must be at least 2 characters.');
			return;
		}

		if (!shopDomain) return;

		try {
			setIsCreating(true);
			const { data } = await axios.post(`/api/shops/${shopDomain}/categories`, { name });
			setCategories((prev) => [data, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
			setNewCategoryName('');
			toast.success('Category created successfully.');
      dispatch(fetchShopCategories(shopDomain));
		} catch (error) {
			console.error('Error creating category:', error);
			toast.error('Failed to create category.');
		} finally {
			setIsCreating(false);
		}
	};

	const startEdit = (category: Category) => {
		setEditingCategoryId(category.id);
		setEditingCategoryName(category.name);
	};

	const cancelEdit = () => {
		setEditingCategoryId(null);
		setEditingCategoryName('');
	};

	const handleUpdateCategory = async (categoryId: number) => {
		const name = editingCategoryName.trim();
		if (name.length < 2) {
			toast.error('Category name must be at least 2 characters.');
			return;
		}

		if (!shopDomain) return;

		try {
			setIsUpdatingCategory(true);
			const { data } = await axios.put(`/api/shops/${shopDomain}/categories/${categoryId}`, {
				name,
			});

			setCategories((prev) =>
				prev
					.map((category) => (category.id === categoryId ? data : category))
					.sort((a, b) => a.name.localeCompare(b.name)),
			);
			toast.success('Category updated successfully.');
      dispatch(fetchShopCategories(shopDomain));
			cancelEdit();
		} catch (error) {
			console.error('Error updating category:', error);
			toast.error('Failed to update category.');
		} finally {
			setIsUpdatingCategory(false);
		}
	};

	const handleDeleteCategory = async (categoryId: number) => {
		if (!shopDomain) return;

		const confirmed = window.confirm('Delete this category? This action cannot be undone.');
		if (!confirmed) return;

		try {
			setDeletingCategoryId(categoryId);
			await axios.delete(`/api/shops/${shopDomain}/categories/${categoryId}`);
			setCategories((prev) => prev.filter((category) => category.id !== categoryId));
			toast.success('Category deleted successfully.');
			if (editingCategoryId === categoryId) {
				cancelEdit();
			}
      dispatch(fetchShopCategories(shopDomain));
		} catch (error) {
			console.error('Error deleting category:', error);
			toast.error('Failed to delete category.');
		} finally {
			setDeletingCategoryId(null);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border-b border-border">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
							<Layers3 className="w-5 h-5 text-foreground" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-foreground">Categories</h1>
							<p className="text-sm text-muted-foreground">Organize products with simple, clean category groups.</p>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
				<section className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-base font-semibold text-foreground">Create Category</h2>
						<span className="text-xs text-muted-foreground">{categories.length} total</span>
					</div>

					<form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
						<div className="flex-1 space-y-2">
							<Label htmlFor="category-name">Category Name</Label>
							<Input
								id="category-name"
								value={newCategoryName}
								onChange={(e) => setNewCategoryName(e.target.value)}
								placeholder="e.g. Electronics"
								maxLength={60}
							/>
						</div>

						<div className="sm:self-end">
							<Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
								{isCreating ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<FolderPlus className="w-4 h-4 mr-2" />
										Add Category
									</>
								)}
							</Button>
						</div>
					</form>
				</section>

				<section className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<h2 className="text-base font-semibold text-foreground">Category List</h2>

						<div className="relative w-full sm:w-80">
							<Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search categories"
								className="pl-9"
							/>
						</div>
					</div>

					{isLoading ? (
						<div className="py-10 flex items-center justify-center text-muted-foreground">
							<Loader2 className="w-5 h-5 animate-spin mr-2" />
							Loading categories...
						</div>
					) : filteredCategories.length === 0 ? (
						<div className="rounded-md border border-dashed border-border p-8 text-center">
							<Tag className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
							<p className="text-sm font-medium text-foreground">
								{categories.length === 0 ? 'No categories yet' : 'No categories match your search'}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{categories.length === 0
									? 'Create your first category to start organizing products.'
									: 'Try another keyword.'}
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{filteredCategories.map((category) => (
								<div
									key={category.id}
									className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-3"
								>
									<div className="min-w-0 flex-1">
										{editingCategoryId === category.id ? (
											<div className="space-y-1">
												<Input
													value={editingCategoryName}
													onChange={(e) => setEditingCategoryName(e.target.value)}
													maxLength={60}
													disabled={isUpdatingCategory}
												/>
												<p className="text-xs text-muted-foreground">/{category.slug}</p>
											</div>
										) : (
											<>
												<p className="text-sm font-medium text-foreground truncate">{category.name}</p>
												<p className="text-xs text-muted-foreground truncate">/{category.slug}</p>
											</>
										)}
									</div>

									<div className="flex items-center gap-1">
										{editingCategoryId === category.id ? (
											<>
												<Button
													type="button"
													size="sm"
													variant="outline"
													disabled={isUpdatingCategory}
													onClick={() => handleUpdateCategory(category.id)}
												>
													{isUpdatingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
												</Button>
												<Button
													type="button"
													size="sm"
													variant="ghost"
													disabled={isUpdatingCategory}
													onClick={cancelEdit}
												>
													<X className="w-4 h-4" />
												</Button>
											</>
										) : (
											<>
												<Button
													type="button"
													size="sm"
													variant="ghost"
													onClick={() => startEdit(category)}
												>
													<Pencil className="w-4 h-4" />
												</Button>
												<Button
													type="button"
													size="sm"
													variant="ghost"
													disabled={deletingCategoryId === category.id}
													onClick={() => handleDeleteCategory(category.id)}
												>
													{deletingCategoryId === category.id ? (
														<Loader2 className="w-4 h-4 animate-spin" />
													) : (
														<Trash2 className="w-4 h-4" />
													)}
												</Button>
											</>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
