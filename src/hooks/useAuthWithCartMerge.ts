import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { hasLocalCartItems, getLocalCart, clearLocalCart } from '@/lib/localCart';
import axios from 'axios';
import { useAppSelector } from './redux.hook';

/**
 * Hook to handle authentication with automatic cart merging
 */
export function useAuthWithCartMerge() {
  const [isMergingCart, setIsMergingCart] = useState(false);
  const { shop } = useAppSelector(state => state.shop);
  const router = useRouter();
  const shopDomain = shop?.domain || '';

  const mergeCartsAfterAuth = useCallback(async () => {
    if (!hasLocalCartItems()) return;

    setIsMergingCart(true);
    try {
      const localCartWithProducts = getLocalCart();
      
      if (localCartWithProducts.items.length === 0) return;

      // Convert CartItemWithProduct[] to CartItem[] for the API
      const localItems = localCartWithProducts.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        variant_index: item.variant_index
      }));

      // Merge local cart with user cart
      await axios.post(`/api/shops/${shopDomain}/cart/merge`, {
        items: localItems
      });

      // Clear local storage after successful merge
      clearLocalCart();
      
      console.log(`Cart merged successfully for shop ${shopDomain}`);
    } catch (error) {
      console.error(`Error merging cart for shop ${shopDomain}:`, error);
    } finally {
      setIsMergingCart(false);
    }
  }, [shopDomain]);

  const loginWithCartMerge = useCallback(async (
    credentials: { email: string; password: string },
    redirectUrl: string = '/'
  ) => {
    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password. Please try again.');
      }

      if (result?.ok) {
        // Check if we need to merge carts
        if (hasLocalCartItems()) {
          await mergeCartsAfterAuth();
        }
        
        router.push(redirectUrl);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }, [mergeCartsAfterAuth, router]);

  const signupWithCartMerge = useCallback(async (
    userData: {
      email: string;
      password: string;
      username: string;
      phone_number: string;
      address: string;
      city: string;
    },
    redirectUrl: string = '/'
  ) => {
    try {
      // Register the user
      const response = await axios.post('/api/auth/register', userData);

      if (response.data) {
        // Sign in the user after successful registration
        const signInResult = await signIn('credentials', {
          email: userData.email,
          password: userData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          // Check if we need to merge carts
          if (hasLocalCartItems()) {
            await mergeCartsAfterAuth();
          }
          
          router.push(redirectUrl);
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }, [mergeCartsAfterAuth, router]);

  return {
    loginWithCartMerge,
    signupWithCartMerge,
    isMergingCart,
  };
}
