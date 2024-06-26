import React, { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { useQuery, useLazyQuery } from '@apollo/client';
import { TextField, List, ListItem, ListItemText, Box, ListItemAvatar, Avatar } from '@mui/material';
import { AUTOCOMPLETE_FOOD_ITEM } from '../graphql/queries/autocompleteFoodItem';
import { GET_FOOD_DETAIL } from '../graphql/queries/getFoodDetail';
import FoodDetailModal from './FoodDetailModal'; // Ensure this component is implemented as shown previously
import { InputAdornment, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

type AutocompleteFoodItemResponse = {
  autocompleteFoodItem: Array<{
    name: string;
    imageUrl: string;
  }>;
};

type AutocompleteFoodItemVariables = {
  searchTerm: string;
};

type FoodDetailResponse = {
  getFoodDetail: {
    food_name: string;
    serving_qty: number;
    serving_unit: string;
    nf_calories: number;
    imageUrl?: string;
  };
};

type FoodDetailVariables = {
  foodName: string;
};

interface AutocompleteInputProps {
  onAddManually: () => void
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ onAddManually }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { data, loading } = useQuery<AutocompleteFoodItemResponse, AutocompleteFoodItemVariables>(
    AUTOCOMPLETE_FOOD_ITEM, {
    variables: { searchTerm },
    skip: searchTerm.length < 3,
  }
  );
  const [getFoodDetail, { loading: detailLoading, data: foodDetailData }] = useLazyQuery<FoodDetailResponse, FoodDetailVariables>(GET_FOOD_DETAIL);

  const handleSearchChange = useCallback(debounce((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, 50), []);

  const suggestions = data?.autocompleteFoodItem;

  const foodDetail = foodDetailData ? foodDetailData.getFoodDetail : null;

  const handleListItemClick = (foodName: string) => {
    getFoodDetail({ variables: { foodName } });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 360,
      position: 'relative',
      bgcolor: 'background.paper',
      '& .MuiTextField-root': {
        mb: 1, // Margin bottom for the text field
      },
    }}>
      <TextField
        fullWidth
        label="Search food item & Add"
        variant="outlined"
        value={searchTerm}
        onChange={(event) => handleSearchChange(event.currentTarget.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {searchTerm && (
                <IconButton
                  onClick={() => setSearchTerm("")}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
      <List sx={{
        position: 'absolute',
        width: '100%',
        maxHeight: 300,
        overflow: 'auto',
        zIndex: 1000,
        bgcolor: 'background.paper',
        '& .MuiListItem-root': { // Apply styles for each ListItem
          borderBottom: '1px solid', // To visually separate items
          borderBottomColor: 'divider', // Use theme's divider color
          '&:hover': {
            bgcolor: 'action.hover', // Background color on hover based on theme
          },
          '& .MuiListItemText-primary': { // Styling the primary text inside the ListItemText
            fontWeight: 'medium', // Make the font a bit heavier
          },
          '& .MuiAvatar-root': { // Styling for avatar
            width: 28,
            height: 28,
          },
        },
      }}>
        {suggestions?.map((item, index) => (
          <ListItem key={index} button onClick={() => {
            handleListItemClick(item.name);
          }}>
            <ListItemText primary={item.name} />
            <ListItemAvatar><Avatar src={item.imageUrl} /></ListItemAvatar>
          </ListItem>
        ))}
        {suggestions?.length === 0 && searchTerm.length > 2 && (
          <ListItem button onClick={onAddManually}>
            <ListItemText primary="No results found. Add manually?" />
          </ListItem>
        )}
      </List>
      {/* Food Detail Modal */}
      <FoodDetailModal
        open={modalOpen}
        handleClose={handleModalClose}
        loading={detailLoading}
        foodDetail={foodDetail}
      />
    </Box>
  );
};

export default AutocompleteInput;
