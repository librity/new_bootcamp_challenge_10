import React, { useState, useEffect, useCallback } from 'react';

import api from '../../services/api';

import Header from '../../components/Header';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editableFood, setEditableFood] = useState<IFoodPlate>(
    {} as IFoodPlate,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      await api.get('foods').then(response => setFoods(response.data));
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const id = foods.length + 1;

        const newFoods = { id, ...food, available: true };

        const response = await api.post('foods', newFoods);

        setFoods([...foods, response.data]);
      } catch (err) {
        console.error(err);
      }
    },
    [foods],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const { id, available } = editableFood;

        const newFoods = { id, ...food, available: true };

        const response = await api.put(`/foods/${editableFood.id}`, newFoods);

        const updatedState = foods.filter(item => item.id !== id);

        setFoods([...updatedState, response.data]);
      } catch (err) {
        console.error(err);
      }
    },
    [foods, editableFood],
  );

  const handleDeleteFood = useCallback(
    async (id: number): Promise<void> => {
      try {
        await api.delete(`/foods/${id}`);

        const updatedState = foods.filter(food => food.id !== id);

        setFoods(updatedState);
      } catch (err) {
        console.error(err);
      }
    },
    [foods],
  );

  const toggleModal = useCallback((): void => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  const toggleEditModal = useCallback((): void => {
    setIsEditModalOpen(!isEditModalOpen);
  }, [isEditModalOpen]);

  const handleEditFood = useCallback((food: IFoodPlate): void => {
    setEditableFood(food);
    setIsEditModalOpen(true);
  }, []);

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={isModalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={isEditModalOpen}
        setIsOpen={toggleEditModal}
        editableFood={editableFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
