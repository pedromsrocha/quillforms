/**
 * QuillForms Dependencies.
 */
import {
	SelectControl,
	Button,
	BaseControl,
	ControlLabel,
	ControlWrapper,
	ToggleControl,
} from '@quillforms/admin-components';

/**
 * WordPress Dependencies
 */
import { CheckboxControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * External Dependencies
 */
import { css } from 'emotion';
import Loader from 'react-loader-spinner';

/**
 * Internal Dependencies
 */
import './style.scss';

const General = () => {
	const [ settings, setSettings ] = useState( null );
	const { createErrorNotice, createSuccessNotice } = useDispatch(
		'core/notices'
	);

	useEffect( () => {
		apiFetch( {
			path: `/qf/v1/settings?groups=general`,
			method: 'GET',
		} )
			.then( ( res ) => {
				setSettings( res.general );
			} )
			.catch( () => {
				setSettings( false );
			} );
	}, [] );

	const save = () => {
		apiFetch( {
			path: `/qf/v1/settings`,
			method: 'POST',
			data: settings,
		} )
			.then( () => {
				createSuccessNotice( '✅ Settings saved', {
					type: 'snackbar',
					isDismissible: true,
				} );
			} )
			.catch( ( err ) => {
				createErrorNotice( `⛔ ${ err ?? 'Error' }`, {
					type: 'snackbar',
					isDismissible: true,
				} );
			} );
	};

	const setSettingField = ( key, value ) => {
		setSettings( ( settings ) => {
			return {
				...settings,
				[ key ]: value,
			};
		} );
	};

	const logLevelOptions = [
		{
			key: 'notice',
			name: 'Errors',
		},
		{
			key: 'info',
			name: 'Info & Errors',
		},
		{
			key: 'debug',
			name: 'Debug & Info & Errors',
		},
	];

	return (
		<div className="quillforms-settings-general-tab">
			{ settings === null ? (
				<div
					className={ css`
						display: flex;
						flex-wrap: wrap;
						width: 100%;
						height: 100px;
						justify-content: center;
						align-items: center;
					` }
				>
					<Loader
						type="ThreeDots"
						color="#8640e3"
						height={ 50 }
						width={ 50 }
					/>
				</div>
			) : ! settings ? (
				<div className="error">Cannot load settings</div>
			) : (
				<div>
					<BaseControl>
						<ControlWrapper orientation="horizontal">
							<ControlLabel label="Log level"></ControlLabel>
							<SelectControl
								className={ css`
									width: 200px;
									margin-left: 10px;

									.components-custom-select-control__label {
										margin-bottom: 0;
									}
								` }
								value={ logLevelOptions.find(
									( option ) =>
										option.key === settings.log_level
								) }
								onChange={ ( selectedChoice ) => {
									setSettingField(
										'log_level',
										selectedChoice.selectedItem.key
									);
								} }
								options={ logLevelOptions }
							/>
						</ControlWrapper>
					</BaseControl>
					<BaseControl>
						<ControlWrapper orientation="horizontal">
							<ControlLabel label="Process form entry for integrations synchronously" />

							<ToggleControl
								checked={
									settings?.providers_sync_entry_process
								}
								onChange={ () => {
									setSettingField(
										'providers_sync_entry_process',
										! settings?.providers_sync_entry_process
									);
								} }
							/>
						</ControlWrapper>
					</BaseControl>
					<BaseControl>
						<ControlWrapper orientation="horizontal">
							<ControlLabel label="Disable collecting user ip" />

							<ToggleControl
								checked={ settings.disable_collecting_user_ip }
								onChange={ () => {
									setSettingField(
										'disable_collecting_user_ip',
										! settings.disable_collecting_user_ip
									);
								} }
							/>
						</ControlWrapper>
					</BaseControl>
					<BaseControl>
						<ControlWrapper orientation="horizontal">
							<ControlLabel label="Disable collecting user agent" />

							<ToggleControl
								checked={
									settings.disable_collecting_user_agent
								}
								onChange={ () => {
									setSettingField(
										'disable_collecting_user_agent',
										! settings.disable_collecting_user_agent
									);
								} }
							/>
						</ControlWrapper>
					</BaseControl>

					<div
						className={ css`
							text-align: left;
							margin-top: 20px;
						` }
					>
						<Button isLarge isPrimary onClick={ save }>
							Save
						</Button>
					</div>
				</div>
			) }
		</div>
	);
};

export default General;
